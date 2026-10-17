import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Public } from "../../auth/decorators/public.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import type { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import {
  InitiatePaymentDto,
  ProcessRefundDto,
  VerifyPaymentDto,
} from "../dto";
import { PaymentsService } from "../services/payments.service";

@ApiTags("payments")
@Controller("payments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({
    summary: "Initiate payment for an order (supports Cash, Card, Telebirr, CBE Birr, Credit)",
  })
  @ApiResponse({ status: 201, description: "Payment initiated successfully" })
  @ApiResponse({ status: 400, description: "Invalid payment amount or order" })
  @ApiResponse({ status: 409, description: "Order is already fully paid" })
  @Public()
  @Post("initiate")
  async initiate(@Body() dto: InitiatePaymentDto, @Req() req: Request) {
    let actorId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        if (token) {
          const decoded = this.jwtService.decode(token) as { sub?: string } | null;
          if (decoded?.sub) actorId = decoded.sub;
        }
      } catch {
        // Proceed as guest
      }
    }

    return this.paymentsService.initiatePayment(dto, actorId);
  }

  @ApiOperation({
    summary: "Verify or finalize payment status (callback, webhook, or cashier approval)",
  })
  @ApiParam({ name: "id", description: "Payment transaction UUID" })
  @ApiResponse({ status: 200, description: "Payment verified successfully" })
  @ApiResponse({ status: 404, description: "Payment transaction not found" })
  @Public()
  @Post(":id/verify")
  async verify(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: VerifyPaymentDto,
    @Req() req: Request,
  ) {
    let actorId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        if (token) {
          const decoded = this.jwtService.decode(token) as { sub?: string } | null;
          if (decoded?.sub) actorId = decoded.sub;
        }
      } catch {
        // Guest / webhook
      }
    }

    return this.paymentsService.verifyPayment(id, dto, actorId);
  }

  @ApiOperation({
    summary: "Retrieve itemized digital receipt for an order (FR-PAY-006)",
  })
  @ApiParam({ name: "orderId", description: "Order UUID" })
  @ApiResponse({ status: 200, description: "Digital receipt retrieved successfully" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @Public()
  @Get("receipt/:orderId")
  async getReceipt(@Param("orderId", ParseUUIDPipe) orderId: string) {
    return this.paymentsService.getReceipt(orderId);
  }

  @ApiOperation({
    summary: "Retrieve all payment records for an order",
  })
  @ApiParam({ name: "orderId", description: "Order UUID" })
  @ApiResponse({ status: 200, description: "Payment records retrieved" })
  @Public()
  @Get("order/:orderId")
  async getPaymentsByOrder(@Param("orderId", ParseUUIDPipe) orderId: string) {
    return this.paymentsService.getPaymentsByOrder(orderId);
  }

  @ApiOperation({
    summary: "Process an authorized refund for a payment (FR-PAY-007)",
  })
  @ApiParam({ name: "id", description: "Payment transaction UUID" })
  @ApiResponse({ status: 201, description: "Refund recorded and processed" })
  @ApiResponse({ status: 400, description: "Invalid refund amount or status" })
  @ApiBearerAuth("access-token")
  @Roles("ADMIN", "MANAGER")
  @Post(":id/refund")
  async processRefund(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ProcessRefundDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.paymentsService.processRefund(id, dto, user.sub);
  }
}
