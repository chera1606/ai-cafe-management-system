import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import {
  ORDER_STATUSES,
  ORDER_TYPES,
  type OrderStatus,
  type OrderType,
} from "./create-order.dto";

export class OrderQueryDto {
  @ApiPropertyOptional({
    description: "Filter orders by status",
    enum: ORDER_STATUSES,
  })
  @IsIn(ORDER_STATUSES)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: "Filter orders by fulfilment type",
    enum: ORDER_TYPES,
  })
  @IsIn(ORDER_TYPES)
  @IsOptional()
  orderType?: OrderType;

  @ApiPropertyOptional({
    description: "Filter orders by customer ID",
  })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({
    description: "Filter orders created on or after this ISO date",
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Filter orders created on or before this ISO date",
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Number of orders to retrieve (default: 20, max: 100)",
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Page offset (default: 1)",
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;
}

export const KDS_STATIONS = ["ALL", "BARISTA", "KITCHEN"] as const;
export type KdsStation = (typeof KDS_STATIONS)[number];

export class KdsQueueQueryDto {
  @ApiPropertyOptional({
    description: "Preparation station / department filter",
    enum: KDS_STATIONS,
    default: "ALL",
  })
  @IsIn(KDS_STATIONS)
  @IsOptional()
  station?: KdsStation = "ALL";
}

