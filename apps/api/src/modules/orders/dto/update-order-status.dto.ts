import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ORDER_STATUSES, type OrderStatus } from "./create-order.dto";

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: "New status for the order",
    enum: ORDER_STATUSES,
    example: "CONFIRMED",
  })
  @IsIn(ORDER_STATUSES, {
    message: `status must be one of: ${ORDER_STATUSES.join(", ")}`,
  })
  @IsNotEmpty()
  status!: OrderStatus;

  @ApiPropertyOptional({
    description: "Reason if updating or cancelling the order",
    example: "Customer requested cancellation before extraction",
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class CancelOrderDto {
  @ApiPropertyOptional({
    description: "Reason for order cancellation",
    example: "Customer changed mind before preparation began",
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
