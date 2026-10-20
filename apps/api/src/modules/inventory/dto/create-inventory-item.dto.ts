import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import {
  INVENTORY_DEPARTMENTS,
  type InventoryDepartment,
} from "./inventory-constants";

export class CreateInventoryItemDto {
  @ApiProperty({
    description: "Display name of the ingredient or inventory item",
    example: "Yirgacheffe Grade 1 Green Coffee Beans",
  })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    description: "Department assigned to this ingredient",
    enum: INVENTORY_DEPARTMENTS,
    example: "BARISTA",
  })
  @IsEnum(INVENTORY_DEPARTMENTS, {
    message: `department must be one of: ${INVENTORY_DEPARTMENTS.join(", ")}`,
  })
  department!: InventoryDepartment;

  @ApiProperty({
    description: "Starting physical stock quantity",
    example: 25.5,
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0, { message: "quantity must be greater than or equal to 0" })
  currentQuantity!: number;

  @ApiProperty({
    description: "Unit of measurement (e.g. kg, g, l, ml, pcs, bags)",
    example: "kg",
  })
  @IsString()
  @MaxLength(30)
  unitOfMeasure!: string;

  @ApiProperty({
    description: "Minimum threshold quantity that triggers a low-stock alert",
    example: 10.0,
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0, { message: "reorderLevel must be non-negative" })
  reorderLevel!: number;

  @ApiPropertyOptional({
    description: "Unit cost in base currency for valuation tracking",
    example: 14.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitCost?: number;

  @ApiPropertyOptional({
    description: "Primary supplier or vendor name",
    example: "Yirgacheffe Coffee Farmers Cooperative Union",
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  supplier?: string;
}
