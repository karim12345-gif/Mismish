import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  appEnvironment,
  assertDatabaseEnvironmentSafety,
  databaseUrl,
  isAccelerateDatabaseUrl,
} from "../../config/environment";

assertDatabaseEnvironmentSafety(appEnvironment, databaseUrl);

/** Accelerate URLs need accelerateUrl; plain postgres uses the pg driver adapter. */
const usesAccelerate = isAccelerateDatabaseUrl(databaseUrl);

function createClient(): PrismaClient {
  if (usesAccelerate) {
    return new PrismaClient({ accelerateUrl: databaseUrl });
  }
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

export default prisma;
