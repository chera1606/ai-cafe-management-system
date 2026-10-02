import type { Database } from "@cafe/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuditService } from "./audit.service";

describe("AuditService", () => {
  let service: AuditService;
  let mockDb: {
    insert: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDb = {
      insert: vi.fn(),
    };
    service = new AuditService(mockDb as unknown as Database);
  });

  it("should record audit events to database", async () => {
    const mockEvent = {
      id: "event-1",
      action: "AUTH_LOGIN_SUCCESS",
      entityType: "users",
    };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockEvent]),
      }),
    });

    const result = await service.record({
      action: "AUTH_LOGIN_SUCCESS",
      entityType: "users",
      actorUserId: "user-1",
    });

    expect(result).toEqual(mockEvent);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it("should catch errors and not crash the application", async () => {
    mockDb.insert.mockImplementation(() => {
      throw new Error("DB Error");
    });

    const result = await service.record({
      action: "AUTH_LOGIN_FAILED",
      entityType: "users",
    });

    expect(result).toBeNull();
  });
});
