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
  MOVEMENT_TYPES,
  type MovementType,
} from "./inventory-constants";

export class RecordStockMovementDto {
  @ApiProperty({
    description: "UUID of the inventory item",
    example: "11111111-2222-3333-4444-555555555555",
  })
  @IsUUID("4", { message: "inventoryItemId must be a valid UUIDv4" })
  inventoryItemId!: string;

  @ApiProperty({
    description: "Type of stock movement",
    enum: MOVEMENT_TYPES,
    example: "PURCHASE",
  })
  @IsEnum(MOVEMENT_TYPES, {
    message: `movementType must be one of: ${MOVEMENT_TYPES.join(", ")}`,
  })
  movementType!: MovementType;

  @ApiProperty({
    description: "Quantity changed (always positive number; direction determined by movementType)",
    example: 10.0,
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive({ message: "quantity must be greater than zero" })
  quantity!: number;

  @ApiPropertyOptional({
    description: "Unit cost for incoming inventory (FR-INV-004, FR-INV-009)",
    example: 14.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitCost?: number;

  @ApiPropertyOptional({
    description: "Business reference type (e.g., SUPPLIER_INVOICE, MANUAL_COUNT, SPOILAGE, ORDER_CONSUMPTION)",
    example: "SUPPLIER_INVOICE",
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  referenceType?: string;

  @ApiPropertyOptional({
    description: "Supplier batch or lot number (FR-INV-004)",
    example: "BATCH-YIRG-2026-08",
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  batchReference?: string;

  @ApiPropertyOptional({
    description: "Expiration date in ISO YYYY-MM-DD format for perishable tracking (FR-INV-007)",
    example: "2026-12-31",
  })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiPropertyOptional({
    description: "Notes, waste reason, or explanation of adjustment",
    example: "Received weekly delivery from Oromia Coffee Farmers Union",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
