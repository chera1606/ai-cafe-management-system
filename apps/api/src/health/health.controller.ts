import type { Database } from "@cafe/db";
import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DATABASE_TOKEN } from "../modules/database";

@Controller("health")
export class HealthController {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: Database,
  ) {}

  @Get()
  async check() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Database connection failed";
      throw new ServiceUnavailableException(
        `Database connection check failed: ${message}`,
      );
    }
  }
}
