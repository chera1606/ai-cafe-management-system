import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";

export class PurchaseOrderItemDto {
  @ApiProperty({
    description: "UUID of the inventory item being replenished",
    example: "22222222-1111-4000-8000-000000000001",
  })
  @IsUUID("4")
  inventoryItemId!: string;

  @ApiProperty({
    description: "Quantity purchased (positive value in inventory item's unit)",
    example: 25.0,
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantity!: number;

  @ApiProperty({
    description: "Negotiated unit cost in base currency",
    example: 14.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitCost!: number;

  @ApiPropertyOptional({
    description: "Vendor lot or batch code",
    example: "LOT-YIRG-2026-OCT",
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  batchReference?: string;

  @ApiPropertyOptional({
    description: "Expiration date in ISO YYYY-MM-DD format",
    example: "2026-12-31",
  })
  @IsOptional()
  @IsString()
  expirationDate?: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({
    description: "UUID of the supplier",
    example: "55555555-1111-4000-8000-000000000001",
  })
  @IsUUID("4")
  supplierId!: string;

  @ApiPropertyOptional({
    description: "Custom PO reference number. If omitted, will be auto-generated.",
    example: "PO-YIRG-2026-004",
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  purchaseReference?: string;

  @ApiPropertyOptional({
    description: "Purchase order date in ISO YYYY-MM-DD format",
    example: "2026-10-22",
  })
  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @ApiProperty({
    description: "List of items in the purchase order",
    type: [PurchaseOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];

  @ApiPropertyOptional({
    description: "Internal delivery or logistics instructions",
    example: "Deliver before 9:00 AM to front service intake bay",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ReceivePurchaseDto {
  @ApiPropertyOptional({
    description: "Date the shipment was physically checked in (ISO YYYY-MM-DD)",
  })
  @IsOptional()
  @IsString()
  receivedDate?: string;

  @ApiPropertyOptional({
    description: "Receiving user notes or invoice verification remark",
    example: "All sacks inspected; moisture content checked and approved",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
