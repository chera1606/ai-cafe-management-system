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
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  CreatePurchaseOrderDto,
  CreateSupplierDto,
  PurchaseStatus,
  ReceivePurchaseDto,
  SupplierStatus,
  UpdateSupplierDto,
} from "../dto";
import { ProcurementService } from "../services/procurement.service";

@ApiTags("procurement")
@Controller("procurement")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProcurementController {
  constructor(
    private readonly procurementService: ProcurementService,
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
    summary: "Retrieve supplier directory with status and keyword filters (FR-PROC-001)",
  })
  @ApiResponse({ status: 200, description: "Suppliers retrieved successfully" })
  @Public()
  @Get("suppliers")
  async getSuppliers(
    @Query("status") status?: SupplierStatus,
    @Query("search") search?: string,
  ) {
    return this.procurementService.findAllSuppliers(status, search);
  }

  @ApiOperation({
    summary: "Retrieve single supplier profile with historical purchase orders (FR-PROC-001, FR-PROC-002)",
  })
  @ApiParam({ name: "id", description: "UUID of the supplier" })
  @ApiResponse({ status: 200, description: "Supplier profile retrieved" })
  @ApiResponse({ status: 404, description: "Supplier not found" })
  @Public()
  @Get("suppliers/:id")
  async getSupplierById(@Param("id", ParseUUIDPipe) id: string) {
    return this.procurementService.findSupplierById(id);
  }

  @ApiOperation({
    summary: "Register a new certified supplier or farm partner (FR-PROC-001)",
  })
  @ApiResponse({ status: 201, description: "Supplier created successfully" })
  @Public()
  @Post("suppliers")
  async createSupplier(@Body() dto: CreateSupplierDto, @Req() req: Request) {
    const actorId = this.extractActorId(req);
    return this.procurementService.createSupplier(dto, actorId);
  }

  @ApiOperation({
    summary: "Update supplier terms, contact details, or active status (FR-PROC-001)",
  })
  @ApiParam({ name: "id", description: "UUID of the supplier" })
  @ApiResponse({ status: 200, description: "Supplier updated successfully" })
  @Public()
  @Patch("suppliers/:id")
  async updateSupplier(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
    @Req() req: Request,
  ) {
    const actorId = this.extractActorId(req);
    return this.procurementService.updateSupplier(id, dto, actorId);
  }

  @ApiOperation({
    summary: "Retrieve historical purchase orders and active shipments (FR-PROC-002)",
  })
  @ApiResponse({ status: 200, description: "Purchases retrieved successfully" })
  @Public()
  @Get("purchases")
  async getPurchases(
    @Query("supplierId") supplierId?: string,
    @Query("status") status?: PurchaseStatus,
  ) {
    return this.procurementService.findAllPurchases(supplierId, status);
  }

  @ApiOperation({
    summary: "Retrieve purchase order details with itemized manifest (FR-PROC-002)",
  })
  @ApiParam({ name: "id", description: "UUID of the purchase order" })
  @ApiResponse({ status: 200, description: "Purchase order retrieved" })
  @ApiResponse({ status: 404, description: "Purchase order not found" })
  @Public()
  @Get("purchases/:id")
  async getPurchaseById(@Param("id", ParseUUIDPipe) id: string) {
    return this.procurementService.findPurchaseById(id);
  }

  @ApiOperation({
    summary: "Create a new purchase order for supplier replenishment (FR-PROC-002)",
  })
  @ApiResponse({ status: 201, description: "Purchase order created successfully" })
  @Public()
  @Post("purchases")
  async createPurchaseOrder(
    @Body() dto: CreatePurchaseOrderDto,
    @Req() req: Request,
  ) {
    const actorId = this.extractActorId(req);
    return this.procurementService.createPurchaseOrder(dto, actorId);
  }

  @ApiOperation({
    summary: "Receive incoming purchase shipment and automatically increment physical inventory stock (FR-PROC-002, FR-INV-003)",
  })
  @ApiParam({ name: "id", description: "UUID of the purchase order" })
  @ApiResponse({ status: 200, description: "Shipment received and inventory replenished" })
  @ApiResponse({ status: 409, description: "Purchase order is already received" })
  @Public()
  @Post("purchases/:id/receive")
  async receivePurchase(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReceivePurchaseDto,
    @Req() req: Request,
  ) {
    const actorId = this.extractActorId(req);
    return this.procurementService.receivePurchase(id, dto, actorId);
  }

  @ApiOperation({
    summary: "Retrieve procurement spend metrics and supplier performance analytics (FR-PROC-003)",
  })
  @ApiResponse({ status: 200, description: "Procurement analytics generated successfully" })
  @Public()
  @Get("analytics")
  async getAnalytics() {
    return this.procurementService.getProcurementAnalytics();
  }
}
