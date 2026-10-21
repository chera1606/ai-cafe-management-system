import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class RecipeOrderItemDto {
  @ApiProperty({
    description: "UUID of the menu item",
    example: "11111111-2222-3333-4444-555555555555",
  })
  @IsUUID("4")
  menuItemId!: string;

  @ApiProperty({
    description: "Portion count prepared and sold",
    example: 2,
  })
  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class DepleteOrderRecipeDto {
  @ApiPropertyOptional({
    description: "Associated order ID",
    example: "33333333-4444-5555-6666-777777777777",
  })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiProperty({
    description: "List of menu items in the order",
    type: [RecipeOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeOrderItemDto)
  items!: RecipeOrderItemDto[];
}
