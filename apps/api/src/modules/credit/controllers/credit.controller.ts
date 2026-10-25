import {
  Body,
  Controller,
  Get,
  Param,
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
  AdjustCreditBalanceDto,
  ChargeCreditAccountDto,
  CreateCreditAccountDto,
  CreditQueryDto,
  RecordCreditPaymentDto,
  UpdateCreditAccountDto,
} from "../dto";
import { CreditService } from "../services/credit.service";

@ApiTags("credit")
@Controller("credit")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreditController {
  constructor(
    private readonly creditService: CreditService,
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
        // Non-fatal token parse fallback
      }
    }
    return undefined;
  }

  @ApiOperation({
    summary: "List all customer credit accounts with balance and utilization",
  })
  @ApiResponse({
    status: 200,
    description: "Returns matching credit accounts",
  })
  @Public()
  @Get("accounts")
  async getAccounts(@Query() query: CreditQueryDto) {
    return this.creditService.getCreditAccounts(query);
  }

  @ApiOperation({
    summary: "Get aggregated credit facility metrics and analytics",
  })
  @ApiResponse({
    status: 200,
    description: "Returns portfolio credit limits, outstanding balances, and utilization",
  })
  @Public()
  @Get("accounts/analytics")
  async getAnalytics() {
    return this.creditService.getCreditAnalytics();
  }

  @ApiOperation({
    summary: "Look up an active credit line for a specific customer ID",
  })
  @ApiParam({ name: "customerId", description: "Customer UUID" })
  @ApiResponse({
    status: 200,
    description: "Returns active credit line or null if customer has no account",
  })
  @Public()
  @Get("accounts/customer/:customerId")
  async getAccountByCustomer(@Param("customerId") customerId: string) {
    return this.creditService.getCreditAccountByCustomerId(customerId);
  }

  @ApiOperation({
    summary: "Get single credit account by ID with full transaction ledger",
  })
  @ApiParam({ name: "id", description: "Credit account UUID" })
  @ApiResponse({
    status: 200,
    description: "Returns account details with transaction audit trail",
  })
  @Public()
  @Get("accounts/:id")
  async getAccountById(@Param("id") id: string) {
    return this.creditService.getCreditAccountById(id);
  }

  @ApiOperation({
    summary: "Open a new customer credit line facility",
  })
  @ApiBearerAuth("access-token")
  @ApiResponse({
    status: 201,
    description: "Credit account opened successfully",
  })
  @Post("accounts")
  async createAccount(@Body() dto: CreateCreditAccountDto, @Req() req: Request) {
    const actorId = this.extractActorId(req);
    return this.creditService.createCreditAccount(dto, actorId);
  }

  @ApiOperation({
    summary: "Update credit facility limit, operational status, or internal notes",
  })
  @ApiBearerAuth("access-token")
  @ApiParam({ name: "id", description: "Credit account UUID" })
  @ApiResponse({
    status: 200,
    description: "Credit account updated successfully",
  })
  @Patch("accounts/:id")
  async updateAccount(
    @Param("id") id: string,
    @Body() dto: UpdateCreditAccountDto,
    @Req() req: Request,
  ) {
    const actorId = this.extractActorId(req);
    return this.creditService.updateCreditAccount(id, dto, actorId);
  }

  @ApiOperation({
    summary: "Charge an order or dining ticket against an active house account",
  })
  @ApiBearerAuth("access-token")
  @ApiParam({ name: "id", description: "Credit account UUID" })
  @ApiResponse({
    status: 201,
    description: "Charge recorded and balance incremented",
  })
  @Post("accounts/:id/charge")
  async chargeAccount(
    @Param("id") id: string,
    @Body() dto: ChargeCreditAccountDto,
    @Req() req: Request,
  ) {
    const actorId = this.extractActorId(req);
    return this.creditService.chargeCreditAccount(id, dto, actorId);
  }

  @ApiOperation({
    summary: "Record repayment settlement (Cash, Telebirr, CBE Birr, Bank Transfer)",
  })
  @ApiBearerAuth("access-token")
  @ApiParam({ name: "id", description: "Credit account UUID" })
  @ApiResponse({
    status: 201,
    description: "Repayment recorded and balance decremented",
  })
  @Post("accounts/:id/payment")
  async recordPayment(
    @Param("id") id: string,
    @Body() dto: RecordCreditPaymentDto,
    @Req() req: Request,
  ) {
    const actorId = this.extractActorId(req);
    return this.creditService.recordPayment(id, dto, actorId);
  }

  @ApiOperation({
    summary: "Apply mandatory audit-governed balance adjustment",
  })
  @ApiBearerAuth("access-token")
  @ApiParam({ name: "id", description: "Credit account UUID" })
  @ApiResponse({
    status: 201,
    description: "Balance adjusted with mandatory audit reason",
  })
  @Post("accounts/:id/adjust")
  async adjustBalance(
    @Param("id") id: string,
    @Body() dto: AdjustCreditBalanceDto,
    @Req() req: Request,
  ) {
    const actorId = this.extractActorId(req);
    return this.creditService.adjustBalance(id, dto, actorId);
  }
}
