import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
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

export class InventoryQueryDto {
  @ApiPropertyOptional({
    description: "Filter items by department",
    enum: INVENTORY_DEPARTMENTS,
  })
  @IsOptional()
  @IsEnum(INVENTORY_DEPARTMENTS)
  department?: InventoryDepartment;

  @ApiPropertyOptional({
    description: "Filter items by stock level status",
    enum: INVENTORY_STATUSES,
  })
  @IsOptional()
  @IsEnum(INVENTORY_STATUSES)
  status?: InventoryStatus;

  @ApiPropertyOptional({
    description: "Search keyword matching ingredient name or supplier",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: "Limit the number of records returned",
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: "Offset for pagination",
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
