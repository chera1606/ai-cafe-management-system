import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class ProcessRefundDto {
  @ApiPropertyOptional({
    description: "Refund amount. If omitted, full paid amount is refunded.",
    example: 18.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "amount must have up to 2 decimal places" })
  @IsPositive({ message: "amount must be greater than zero" })
  amount?: number;

  @ApiProperty({
    description: "Detailed operational reason for refund",
    example: "Customer requested cancellation before order preparation began",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: "reason must be at least 3 characters long" })
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({
    description: "External provider refund reference ID",
    example: "REF-TB-1928374",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  providerReference?: string;
}
