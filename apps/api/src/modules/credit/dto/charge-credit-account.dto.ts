import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class ChargeCreditAccountDto {
  @ApiProperty({
    description: "Amount to charge to the house credit account in ETB",
    example: 450.0,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({
    description: "Associated order ID if charged from dining ticket or POS",
    example: "99999999-1111-4000-8000-000000000001",
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({
    description: "External receipt, invoice, or voucher reference",
    example: "INV-CORP-2026-089",
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: "Remarks or authorized dining personnel",
    example: "Delegation lunch executive conference table 4",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
