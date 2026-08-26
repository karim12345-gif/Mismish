import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { Prisma } from "@prisma/client";
import prisma from "../src/shared/lib/prisma";

const execFileAsync = promisify(execFile);
const chunkSize = 500_000;
const workDir = join(tmpdir(), "mismish-listing-image-backups");

type OversizedImage = {
  id: number;
  characters: number;
};

async function readImageInChunks(id: number, characters: number) {
  let value = "";

  for (let offset = 1; offset <= characters; offset += chunkSize) {
    const [row] = await prisma.$queryRaw<Array<{ chunk: string | null }>>(
      Prisma.sql`
        SELECT substr("imageUrl", ${offset}, ${chunkSize}) AS chunk
        FROM "SurpriseBox"
        WHERE id = ${id}
      `,
    );

    value += row?.chunk ?? "";
  }

  return value;
}

async function compressImage(row: OversizedImage) {
  const dataUrl = await readImageInChunks(row.id, row.characters);
  const match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/s);

  if (!match) {
    console.log(`Listing ${row.id}: skipped because image is not a data URL`);
    return;
  }

  const originalPath = join(workDir, `listing-${row.id}-original.data-url.txt`);
  const sourcePath = join(workDir, `listing-${row.id}-source-image`);
  const outputPath = join(workDir, `listing-${row.id}-compressed.jpg`);

  await writeFile(originalPath, dataUrl, "utf8");
  await writeFile(sourcePath, Buffer.from(match[1], "base64"));
  await execFileAsync("/usr/bin/sips", [
    "--resampleHeightWidthMax",
    "1400",
    "-s",
    "format",
    "jpeg",
    "-s",
    "formatOptions",
    "82",
    sourcePath,
    "--out",
    outputPath,
  ]);

  const compressed = await readFile(outputPath);
  const compressedDataUrl = `data:image/jpeg;base64,${compressed.toString("base64")}`;

  await prisma.surpriseBox.update({
    where: { id: row.id },
    data: { imageUrl: compressedDataUrl },
    select: { id: true },
  });

  console.log(
    `Listing ${row.id}: ${row.characters} -> ${compressedDataUrl.length} characters`,
  );
}

async function main() {
  await mkdir(workDir, { recursive: true });

  const oversizedImages = await prisma.$queryRaw<OversizedImage[]>(
    Prisma.sql`
      SELECT id, length("imageUrl")::int AS characters
      FROM "SurpriseBox"
      WHERE "imageUrl" LIKE 'data:image/%'
        AND length("imageUrl") > 500000
      ORDER BY id
    `,
  );

  console.log(`Found ${oversizedImages.length} oversized listing image(s)`);

  for (const row of oversizedImages) {
    await compressImage(row);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
