import dotenv from "dotenv";

dotenv.config();

export type AppEnvironment =
  | "local"
  | "test"
  | "staging"
  | "production"
  | "unspecified";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export const appEnvironment = (
  process.env.APP_ENV ??
  (process.env.NODE_ENV === "production" ? "production" : "unspecified")
) as AppEnvironment;

export const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

export const isAccelerateDatabaseUrl = (url: string): boolean =>
  url.startsWith("prisma+postgres://") ||
  url.startsWith("prisma://") ||
  url.includes("accelerate.prisma-data.net");

const parseDatabaseUrl = (url: string): URL | null => {
  if (!url || isAccelerateDatabaseUrl(url)) return null;

  try {
    return new URL(url);
  } catch {
    return null;
  }
};

export const isLocalDatabaseUrl = (url: string): boolean => {
  const parsed = parseDatabaseUrl(url);
  return Boolean(
    parsed &&
      LOOPBACK_HOSTS.has(parsed.hostname) &&
      parsed.port === "5433" &&
      parsed.pathname === "/mismish_local",
  );
};

export const assertDatabaseEnvironmentSafety = (
  environment: AppEnvironment,
  url: string,
): void => {
  if (!url) throw new Error("DATABASE_URL is required.");

  if (environment === "local" && !isLocalDatabaseUrl(url)) {
    throw new Error(
      "APP_ENV=local requires the local mismish_local database on " +
        "127.0.0.1:5433. Refusing to connect to a cloud or production database.",
    );
  }
};

