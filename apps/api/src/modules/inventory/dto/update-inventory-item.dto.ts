import { ApiPropertyOptional } from "@nestjs/swagger";
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
  INVENTORY_STATUSES,
  type InventoryDepartment,
  type InventoryStatus,
} from "./inventory-constants";

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({
    description: "Configurable reorder / low-stock threshold (FR-INV-006)",
    example: 12.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional({
    description: "Assigned preparation or storage department (FR-INV-005)",
    enum: INVENTORY_DEPARTMENTS,
    example: "BARISTA",
  })
  @IsOptional()
  @IsEnum(INVENTORY_DEPARTMENTS)
  department?: InventoryDepartment;

  @ApiPropertyOptional({
    description: "Standard unit cost in base currency (FR-INV-009)",
    example: 15.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitCost?: number;

  @ApiPropertyOptional({
    description: "Manual override status if item is archived or deactivated",
    enum: INVENTORY_STATUSES,
    example: "IN_STOCK",
  })
  @IsOptional()
  @IsEnum(INVENTORY_STATUSES)
  status?: InventoryStatus;

  @ApiPropertyOptional({
    description: "Supplier or vendor name",
    example: "Sidama Coffee Union",
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  supplier?: string;
}
