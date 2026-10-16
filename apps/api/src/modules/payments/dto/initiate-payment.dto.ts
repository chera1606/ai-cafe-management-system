import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { PAYMENT_METHODS, type PaymentMethod } from "./payment-constants";

export class InitiatePaymentDto {
  @ApiProperty({
    description: "UUID of the order to process payment for",
    example: "11111111-2222-3333-4444-555555555555",
  })
  @IsUUID("4", { message: "orderId must be a valid UUIDv4" })
  orderId!: string;

  @ApiProperty({
    description: "Configured payment method",
    enum: PAYMENT_METHODS,
    example: "CASH",
  })
  @IsEnum(PAYMENT_METHODS, {
    message: `paymentMethod must be one of: ${PAYMENT_METHODS.join(", ")}`,
  })
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({
    description: "Payment amount in base currency. If omitted, full balance due is charged.",
    example: 18.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "amount must be a valid number with up to 2 decimal places" })
  @IsPositive({ message: "amount must be greater than zero" })
  amount?: number;

  @ApiPropertyOptional({
    description: "External payment provider reference or transaction ID (e.g., CBE/Telebirr confirmation code)",
    example: "TXN-TB-9823147",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  providerReference?: string;

  @ApiPropertyOptional({
    description: "Customer mobile phone number for mobile money push prompts",
    example: "+251911223344",
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  customerPhone?: string;

  @ApiPropertyOptional({
    description: "Internal notes or cashier remark for payment verification",
    example: "Cash tendered: $20.00, Change returned: $1.50",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
