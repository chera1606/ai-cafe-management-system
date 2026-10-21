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
import {
  INVENTORY_DEPARTMENTS,
  type InventoryDepartment,
} from "./inventory-constants";
import { WASTE_REASONS, type WasteReason } from "./waste-constants";

export class RecordWasteDto {
  @ApiProperty({
    description: "UUID of the inventory item being wasted",
    example: "22222222-1111-4000-8000-000000000001",
  })
  @IsUUID("4", { message: "inventoryItemId must be a valid UUIDv4" })
  inventoryItemId!: string;

  @ApiProperty({
    description: "Physical quantity wasted (always positive number)",
    example: 1.5,
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive({ message: "quantity must be greater than zero" })
  quantity!: number;

  @ApiProperty({
    description: "Categorized reason for waste (FR-WASTE-002)",
    enum: WASTE_REASONS,
    example: "SPOILED",
  })
  @IsEnum(WASTE_REASONS, {
    message: `reason must be one of: ${WASTE_REASONS.join(", ")}`,
  })
  reason!: WasteReason;

  @ApiPropertyOptional({
    description: "Department where waste occurred (FR-WASTE-004)",
    enum: INVENTORY_DEPARTMENTS,
    example: "BARISTA",
  })
  @IsOptional()
  @IsEnum(INVENTORY_DEPARTMENTS)
  department?: InventoryDepartment;

  @ApiPropertyOptional({
    description: "Additional context, batch reference, or incident explanation",
    example: "Milk carton seal compromised during morning delivery inspection",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
