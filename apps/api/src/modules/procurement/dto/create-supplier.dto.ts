import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import {
  SUPPLIER_STATUSES,
  type SupplierStatus,
} from "./procurement-constants";

export class CreateSupplierDto {
  @ApiProperty({
    description: "Official legal or business trade name of the supplier",
    example: "Yirgacheffe Coffee Farmers Cooperative Union",
  })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({
    description: "Primary contact telephone or mobile number",
    example: "+251 11 662 4589",
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    description: "Direct email address for purchase orders and invoices",
    example: "orders@yirgacheffe-union.et",
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @ApiPropertyOptional({
    description: "Physical depot or farm estate warehouse address",
    example: "Gedeo Zone, Dilla, Southern Ethiopia",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: "Primary commodity category (e.g. Specialty Coffee, Dairy, Spices, Grains)",
    example: "Specialty Coffee",
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({
    description: "Average fulfillment lead time in business days",
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  leadTimeDays?: number;

  @ApiPropertyOptional({
    description: "Operational status",
    enum: SUPPLIER_STATUSES,
    default: "ACTIVE",
  })
  @IsOptional()
  @IsEnum(SUPPLIER_STATUSES)
  status?: SupplierStatus;
}
