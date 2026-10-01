import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function createDatabaseClient(databaseUrl: string) {
  const client = postgres(databaseUrl);
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDatabaseClient>;

export const db: Database = process.env.DATABASE_URL
  ? createDatabaseClient(process.env.DATABASE_URL)
  : (null as unknown as Database);
