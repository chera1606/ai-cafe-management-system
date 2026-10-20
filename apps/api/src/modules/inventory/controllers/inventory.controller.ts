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
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Request } from "express";
import { Public } from "../../auth/decorators/public.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  CreateInventoryItemDto,
  InventoryQueryDto,
  RecordStockMovementDto,
  UpdateInventoryItemDto,
} from "../dto";
import { InventoryService } from "../services/inventory.service";

@ApiTags("inventory")
@Controller("inventory")
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly jwtService: JwtService,
  ) {}

  private extractActorId(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        if (token) {
          const decoded = this.jwtService.decode(token) as { sub?: string } | null;
          if (decoded?.sub) return decoded.sub;
        }
      } catch {
        // Non-fatal fallback
      }
    }
    return undefined;
  }

  @ApiOperation({
    summary: "Retrieve inventory items with filtering by department, status, and search query",
  })
  @ApiResponse({ status: 200, description: "Inventory items retrieved successfully" })
  @Public()
  @Get()
  async getInventory(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @ApiOperation({
    summary: "Retrieve low-stock and out-of-stock items requiring replenishment (FR-INV-006)",
  })
  @ApiResponse({ status: 200, description: "Critical stock alerts retrieved successfully" })
  @Public()
  @Get("alerts/low-stock")
  async getLowStockAlerts() {
    return this.inventoryService.getLowStockAlerts();
  }

  @ApiOperation({
    summary: "Retrieve live stock valuation and metric counters (FR-INV-009)",
  })
  @ApiResponse({ status: 200, description: "Inventory metrics retrieved successfully" })
  @Public()
  @Get("metrics")
  async getMetrics() {
    return this.inventoryService.getMetrics();
  }

  @ApiOperation({
    summary: "Retrieve item details with movement history and active batches",
  })
  @ApiParam({ name: "id", description: "UUID of the inventory item" })
  @ApiResponse({ status: 200, description: "Inventory item detail retrieved" })
  @ApiResponse({ status: 404, description: "Inventory item not found" })
  @Public()
  @Get(":id")
  async getItemDetail(@Param("id", ParseUUIDPipe) id: string) {
    return this.inventoryService.findById(id);
  }

  @ApiOperation({
    summary: "Register a new inventory item and starting balance (FR-INV-001)",
  })
  @ApiResponse({ status: 201, description: "Inventory item created successfully" })
  @Public()
  @Post()
  async createItem(@Body() dto: CreateInventoryItemDto, @Req() req: Request) {
    const actorId = this.extractActorId(req);
    return this.inventoryService.createItem(dto, actorId);
  }

  @ApiOperation({
    summary: "Record stock movements including purchases, waste, usage, and adjustments (FR-INV-003, FR-INV-004)",
  })
  @ApiResponse({ status: 201, description: "Stock movement recorded successfully" })
  @ApiResponse({ status: 400, description: "Invalid quantity or movement parameters" })
  @ApiResponse({ status: 404, description: "Inventory item not found" })
  @Public()
  @Post("movements")
  async recordMovement(@Body() dto: RecordStockMovementDto, @Req() req: Request) {
    const actorId = this.extractActorId(req);
    return this.inventoryService.recordMovement(dto, actorId);
  }

  @ApiOperation({
    summary: "Perform physical stock count reconciliation (FR-INV-008)",
  })
  @ApiParam({ name: "id", description: "UUID of the inventory item" })
  @ApiResponse({ status: 200, description: "Reconciliation adjustment recorded" })
  @Public()
  @Post(":id/reconcile")
  async reconcileItem(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("actualCount") actualCount: number,
    @Body("notes") notes: string | undefined,
    @Req() req: Request,
  ) {
    const actorId = this.extractActorId(req);
    return this.inventoryService.reconcileItem(id, actualCount, notes, actorId);
  }

  @ApiOperation({
    summary: "Update inventory thresholds, department, and supplier information (FR-INV-005, FR-INV-006)",
  })
  @ApiParam({ name: "id", description: "UUID of the inventory item" })
  @ApiResponse({ status: 200, description: "Inventory item updated successfully" })
  @Public()
  @Patch(":id")
  async updateItem(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryItemDto,
    @Req() req: Request,
  ) {
    const actorId = this.extractActorId(req);
    return this.inventoryService.updateItem(id, dto, actorId);
  }
}
