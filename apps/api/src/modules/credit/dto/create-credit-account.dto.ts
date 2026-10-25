import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";
import { CreditAccountStatus } from "./credit-constants";

export class CreateCreditAccountDto {
  @ApiProperty({
    description: "UUID of the customer associated with this credit line",
    example: "88888888-1111-4000-8000-000000000001",
  })
  @IsUUID()
  customerId!: string;

  @ApiProperty({
    description: "Authorized maximum credit limit in ETB",
    example: 25000.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  creditLimit!: number;

  @ApiPropertyOptional({
    description: "Initial balance (defaults to 0.00)",
    example: 0.0,
    default: 0.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialBalance?: number;

  @ApiPropertyOptional({
    description: "Account operational status",
    enum: CreditAccountStatus,
    default: CreditAccountStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CreditAccountStatus)
  status?: CreditAccountStatus;

  @ApiPropertyOptional({
    description: "Internal notes or credit assessment reference",
    example: "Corporate account approved by Finance Director",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
