import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Request } from "express";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Public } from "../../auth/decorators/public.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import type { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import {
  CancelOrderDto,
  CreateOrderDto,
  KdsQueueQueryDto,
  OrderQueryDto,
  UpdateOrderStatusDto,
} from "../dto";
import { OrdersService } from "../services/orders.service";

@ApiTags("orders")
@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({
    summary:
      "Create a new order (supports authenticated customer or guest checkout with duplicate-request protection)",
  })
  @ApiResponse({ status: 201, description: "Order successfully created" })
  @ApiResponse({
    status: 400,
    description: "Invalid items, quantities, or unavailable items",
  })
  @Public()
  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    let authUserId: string | undefined;
    let userRoles: string[] = [];

    // Optional token extraction for guest vs authenticated customer
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const decoded = this.jwtService.decode(token) as {
          sub?: string;
          userId?: string;
          roles?: string[];
        } | null;
        authUserId = decoded?.userId || decoded?.sub;
        userRoles = decoded?.roles || [];
      } catch {
        // Proceed as guest
      }
    }

    return this.ordersService.create(dto, authUserId, userRoles);
  }

  @ApiOperation({
    summary: "Retrieve order history for currently authenticated customer",
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "Customer order history returned" })
  @Get("me")
  async findMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findByUserId(user.userId, query);
  }

  @ApiOperation({
    summary:
      "List all orders with optional status, order type, and date filters (Staff only)",
  })
  @ApiBearerAuth()
  @Roles(
    "ADMIN",
    "ADMINISTRATOR",
    "OWNER",
    "MANAGER",
    "CASHIER",
    "BARISTA",
    "KITCHEN",
  )
  @ApiResponse({ status: 200, description: "List of orders returned" })
  @Get()
  async findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @ApiOperation({
    summary:
      "Retrieve the active KDS preparation queue and workload metrics (FR-KDS-001, FR-KDS-007)",
  })
  @ApiResponse({
    status: 200,
    description: "Active KDS queue and metrics returned",
  })
  @Public()
  @Get("kds/queue")
  async getKdsQueue(@Query() query: KdsQueueQueryDto) {
    return this.ordersService.getKdsQueue(query.station);
  }

  @ApiOperation({
    summary:
      "Public order tracking & status lookup by order UUID (used by customer tracker)",
  })
  @ApiResponse({ status: 200, description: "Order details returned" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @Public()
  @Get(":id")
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }

  @ApiOperation({
    summary:
      "Update order lifecycle state (Staff / Barista / Kitchen / KDS Station)",
  })
  @ApiResponse({ status: 200, description: "Order status updated" })
  @ApiResponse({ status: 400, description: "Invalid state transition" })
  @Public()
  @Patch(":id/status")
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    let authUserId: string | undefined;

    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const decoded = this.jwtService.decode(token) as {
          sub?: string;
          userId?: string;
        } | null;
        authUserId = decoded?.userId || decoded?.sub;
      } catch {
        // Proceed as station
      }
    }

    return this.ordersService.updateStatus(id, dto, authUserId);
  }

  @ApiOperation({
    summary:
      "Cancel an order (Customer can cancel before preparation; Staff can cancel while active)",
  })
  @ApiResponse({ status: 200, description: "Order successfully cancelled" })
  @ApiResponse({
    status: 400,
    description: "Cancellation not permitted in current state",
  })
  @Public()
  @Patch(":id/cancel")
  async cancel(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
    @Req() req: Request,
  ) {
    let authUserId: string | undefined;
    let isStaff = false;

    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const decoded = this.jwtService.decode(token) as {
          sub?: string;
          userId?: string;
          roles?: string[];
        } | null;
        authUserId = decoded?.userId || decoded?.sub;
        const roles = (decoded?.roles || []).map((r) => r.toUpperCase());
        isStaff = roles.some((r) =>
          [
            "ADMIN",
            "ADMINISTRATOR",
            "OWNER",
            "MANAGER",
            "CASHIER",
            "BARISTA",
            "KITCHEN",
          ].includes(r),
        );
      } catch {
        // Proceed as customer
      }
    }

    return this.ordersService.cancel(id, dto.reason, authUserId, isStaff);
  }
}
