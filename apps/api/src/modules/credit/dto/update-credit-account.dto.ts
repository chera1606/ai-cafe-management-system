import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { CreditAccountStatus } from "./credit-constants";

export class UpdateCreditAccountDto {
  @ApiPropertyOptional({
    description: "Updated credit limit in ETB",
    example: 35000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({
    description: "Updated account status",
    enum: CreditAccountStatus,
    example: CreditAccountStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CreditAccountStatus)
  status?: CreditAccountStatus;

  @ApiPropertyOptional({
    description: "Reason or notes for credit limit / status update",
    example: "Annual corporate facility review completed",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
