import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class RecordCreditPaymentDto {
  @ApiProperty({
    description: "Payment settlement amount in ETB",
    example: 5000.0,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({
    description: "Settlement channel or payment method",
    example: "TELEBIRR",
    default: "CASH",
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: "Optional linked payment transaction UUID",
  })
  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @ApiPropertyOptional({
    description: "Bank transfer reference, CBE Birr transaction ID, or check number",
    example: "FT26298ABCD12",
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: "Payment notes or cashier settlement remarks",
    example: "Monthly corporate retainer payment received",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
