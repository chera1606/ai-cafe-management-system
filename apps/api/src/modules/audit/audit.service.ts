import { auditEvents, type Database } from "@cafe/db";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.constants";

export interface CreateAuditEventDto {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  previousState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  requestId?: string | null;
  occurredAt?: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async record(dto: CreateAuditEventDto) {
    try {
      const [event] = await this.db
        .insert(auditEvents)
        .values({
          actorUserId: dto.actorUserId || null,
          action: dto.action,
          entityType: dto.entityType,
          entityId: dto.entityId || null,
          previousState: dto.previousState || null,
          newState: dto.newState || null,
          requestId: dto.requestId || null,
          occurredAt: dto.occurredAt || new Date(),
        })
        .returning();

      return event;
    } catch (error) {
      this.logger.error("Failed to persist audit log entry", error);
      return null;
    }
  }
}
