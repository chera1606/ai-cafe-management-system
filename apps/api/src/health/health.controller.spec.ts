import type { Database } from "@cafe/db";
import { ServiceUnavailableException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;
  let mockDb: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDb = {
      execute: vi.fn(),
    };
    controller = new HealthController(mockDb as unknown as Database);
  });

  it("should return ok and connected status when database query succeeds", async () => {
    mockDb.execute.mockResolvedValueOnce([{ 1: 1 }]);

    const result = await controller.check();

    expect(result.status).toBe("ok");
    expect(result.database).toBe("connected");
    expect(result.timestamp).toBeDefined();
    expect(mockDb.execute).toHaveBeenCalledTimes(1);
  });

  it("should throw ServiceUnavailableException when database query fails", async () => {
    mockDb.execute.mockRejectedValueOnce(new Error("Connection refused"));

    await expect(controller.check()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
