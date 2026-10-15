import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export const ORDER_TYPES = ["DINE_IN", "PICKUP", "DELIVERY"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export class OrderItemDto {
  @ApiProperty({
    description: "UUID of the menu item to order",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @IsUUID()
  @IsNotEmpty()
  menuItemId!: string;

  @ApiProperty({
    description: "Quantity of this item",
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiPropertyOptional({
    description:
      "Item-specific preparation instructions (e.g., Oat milk, extra hot)",
    example: "Oat milk, extra hot",
  })
  @IsString()
  @IsOptional()
  specialInstruction?: string;
}

export class GuestCustomerDto {
  @ApiProperty({ description: "Customer full name", example: "Abebe Bikila" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: "Customer email address",
    example: "abebe@example.com",
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: "Customer phone number",
    example: "+251911223344",
  })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class DeliveryInfoDto {
  @ApiProperty({
    description: "Street address or landmark for delivery",
    example: "Bole Medhanialem, Building 4B, Apt 201",
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional({
    description: "Dropoff instructions for the delivery rider",
    example: "Ring bell twice, leave at reception",
  })
  @IsString()
  @IsOptional()
  dropoffNotes?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: "Order fulfilment type",
    enum: ORDER_TYPES,
    example: "DINE_IN",
  })
  @IsIn(ORDER_TYPES, {
    message: `orderType must be one of: ${ORDER_TYPES.join(", ")}`,
  })
  @IsNotEmpty()
  orderType!: OrderType;

  @ApiPropertyOptional({
    description: "Table number for dine-in orders",
    example: "Table 7",
  })
  @IsString()
  @IsOptional()
  tableNumber?: string;

  @ApiProperty({
    description: "List of items in the order",
    type: [OrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: "Order must contain at least one item" })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiPropertyOptional({
    description: "General order-level special instructions",
    example: "Rush order if possible, guest has a flight",
  })
  @IsString()
  @IsOptional()
  specialInstruction?: string;

  @ApiPropertyOptional({
    description: "Delivery details (required when orderType is DELIVERY)",
    type: DeliveryInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  deliveryInfo?: DeliveryInfoDto;

  @ApiPropertyOptional({
    description:
      "Guest contact information (used when ordering without being logged in)",
    type: GuestCustomerDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GuestCustomerDto)
  guestCustomer?: GuestCustomerDto;

  @ApiPropertyOptional({
    description:
      "Unique idempotency key to prevent accidental duplicate order placements",
    example: "order_req_981273981273",
  })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
