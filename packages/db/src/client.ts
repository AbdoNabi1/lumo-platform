import { PrismaClient } from "@prisma/client";
import type { DatabaseConfig } from "@platform/config/server";

/** The typed database client. Business models are added to the Prisma schema in later sprints. */
export type Database = PrismaClient;

/**
 * Creates a configured PrismaClient. The connection URL is injected (DI) rather than read
 * from the ambient environment, so callers control pooling/credentials per environment.
 * Connection pooling is handled by Prisma's pool (sized via the URL's `connection_limit`);
 * production fronts PostgreSQL with PgBouncer (transaction mode) per docs/architecture/15.
 */
export function createPrismaClient(config: DatabaseConfig): PrismaClient {
  return new PrismaClient({
    datasourceUrl: config.url,
    log: config.logQueries ? ["query", "warn", "error"] : ["warn", "error"],
  });
}
