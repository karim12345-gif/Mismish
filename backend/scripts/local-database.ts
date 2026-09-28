import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const appEnvironment = process.env.APP_ENV?.trim();

const isExpectedLocalDatabase = (): boolean => {
  try {
    const url = new URL(databaseUrl);
    return (
      appEnvironment === "local" &&
      ["localhost", "127.0.0.1", "::1"].includes(url.hostname) &&
      url.port === "5433" &&
      url.pathname === "/mismish_local"
    );
  } catch {
    return false;
  }
};

if (!isExpectedLocalDatabase()) {
  console.error(
    "Refusing database command: APP_ENV must be local and DATABASE_URL must " +
      "target mismish_local on 127.0.0.1:5433.",
  );
  process.exit(1);
}

const run = (args: string[]): void => {
  const result = spawnSync("npx", ["prisma", ...args], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) process.exit(result.status ?? 1);
};

const command = process.argv[2];

if (command === "seed") {
  run(["migrate", "deploy"]);
  run(["db", "push"]);
  run(["db", "seed"]);
} else if (command === "reset") {
  run(["migrate", "reset", "--force"]);
  run(["db", "push"]);
  run(["db", "seed"]);
} else {
  console.error("Usage: local-database.ts <seed|reset>");
  process.exit(1);
}

