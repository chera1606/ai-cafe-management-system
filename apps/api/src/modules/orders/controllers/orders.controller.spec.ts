import type { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OrdersService } from "../services/orders.service";
import { OrdersController } from "./orders.controller";

describe("OrdersController", () => {
  let controller: OrdersController;
  let mockOrdersService: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findByUserId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    getKdsQueue: ReturnType<typeof vi.fn>;
  };
  let mockJwtService: {
    decode: ReturnType<typeof vi.fn>;
  };

  const mockOrderDetail = {
    id: "ord-1",
    orderNumber: "ORD-ABCD",
    orderType: "DINE_IN",
    status: "PENDING",
    totalAmount: 15.5,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockOrdersService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findByUserId: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
      cancel: vi.fn(),
      getKdsQueue: vi.fn(),
    };

    mockJwtService = {
      decode: vi.fn(),
    };

    controller = new OrdersController(
      mockOrdersService as unknown as OrdersService,
      mockJwtService as unknown as JwtService,
    );
  });

  describe("create", () => {
    it("should extract user info from Authorization bearer header when present", async () => {
      mockJwtService.decode.mockReturnValue({
        userId: "user-123",
        roles: ["CUSTOMER"],
      });
      mockOrdersService.create.mockResolvedValue(mockOrderDetail);

      const req = {
        headers: {
          authorization: "Bearer valid-token-123",
        },
      } as unknown as Request;

      const dto = {
        orderType: "DINE_IN" as const,
        items: [{ menuItemId: "m1", quantity: 1 }],
      };

      const result = await controller.create(dto, req);
      expect(mockOrdersService.create).toHaveBeenCalledWith(dto, "user-123", [
        "CUSTOMER",
      ]);
      expect(result).toEqual(mockOrderDetail);
    });

    it("should proceed as guest when no Authorization header is present", async () => {
      mockOrdersService.create.mockResolvedValue(mockOrderDetail);

      const req = {
        headers: {},
      } as unknown as Request;

      const dto = {
        orderType: "DINE_IN" as const,
        items: [{ menuItemId: "m1", quantity: 1 }],
      };

      const result = await controller.create(dto, req);
      expect(mockOrdersService.create).toHaveBeenCalledWith(dto, undefined, []);
      expect(result).toEqual(mockOrderDetail);
    });
  });

  describe("findMyOrders", () => {
    it("should delegate to findByUserId for authenticated user", async () => {
      mockOrdersService.findByUserId.mockResolvedValue([mockOrderDetail]);

      const user = {
        sub: "user-123",
        userId: "user-123",
        email: "user@example.com",
        roles: ["CUSTOMER"],
        permissions: [],
      };

      const result = await controller.findMyOrders(user, {});
      expect(mockOrdersService.findByUserId).toHaveBeenCalledWith(
        "user-123",
        {},
      );
      expect(result).toEqual([mockOrderDetail]);
    });
  });

  describe("findById", () => {
    it("should delegate to findById", async () => {
      mockOrdersService.findById.mockResolvedValue(mockOrderDetail);

      const result = await controller.findById("ord-1");
      expect(mockOrdersService.findById).toHaveBeenCalledWith("ord-1");
      expect(result).toEqual(mockOrderDetail);
    });
  });

  describe("getKdsQueue", () => {
    it("should delegate to getKdsQueue with station filter", async () => {
      const mockQueueResponse = {
        orders: [mockOrderDetail],
        metrics: {
          activeCount: 1,
          pendingCount: 1,
          confirmedCount: 0,
          preparingCount: 0,
          readyCount: 0,
          completedTodayCount: 0,
          averagePrepTimeMinutes: 7,
        },
        station: "BARISTA" as const,
      };
      mockOrdersService.getKdsQueue.mockResolvedValue(mockQueueResponse);

      const result = await controller.getKdsQueue({ station: "BARISTA" });
      expect(mockOrdersService.getKdsQueue).toHaveBeenCalledWith("BARISTA");
      expect(result).toEqual(mockQueueResponse);
    });
  });

  describe("updateStatus", () => {
    it("should delegate to updateStatus with actor ID from token", async () => {
      mockOrdersService.updateStatus.mockResolvedValue({
        ...mockOrderDetail,
        status: "CONFIRMED",
      });
      mockJwtService.decode.mockReturnValue({
        userId: "staff-1",
        roles: ["BARISTA"],
      });

      const req = {
        headers: {
          authorization: "Bearer staff-token",
        },
      } as unknown as Request;

      const result = await controller.updateStatus(
        "ord-1",
        { status: "CONFIRMED" },
        req,
      );
      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
        "ord-1",
        { status: "CONFIRMED" },
        "staff-1",
      );
      expect(result.status).toBe("CONFIRMED");
    });
  });

  describe("cancel", () => {
    it("should identify staff members from bearer token roles and cancel", async () => {
      mockJwtService.decode.mockReturnValue({
        userId: "staff-1",
        roles: ["MANAGER"],
      });
      mockOrdersService.cancel.mockResolvedValue({
        ...mockOrderDetail,
        status: "CANCELLED",
      });

      const req = {
        headers: {
          authorization: "Bearer manager-token",
        },
      } as unknown as Request;

      const result = await controller.cancel(
        "ord-1",
        { reason: "Manager override" },
        req,
      );

      expect(mockOrdersService.cancel).toHaveBeenCalledWith(
        "ord-1",
        "Manager override",
        "staff-1",
        true,
      );
      expect(result.status).toBe("CANCELLED");
    });
  });
});
