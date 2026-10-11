import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class RecipeIngredientDto {
  @ApiProperty({ description: "UUID of the raw ingredient" })
  @IsUUID()
  @IsNotEmpty()
  ingredientId!: string;

  @ApiProperty({
    description: "Required quantity (e.g., '18.000')",
    example: "18.000",
  })
  @IsNumberString()
  @IsNotEmpty()
  quantity!: string;

  @ApiProperty({
    description: "Unit of measure for this recipe ingredient",
    example: "g",
  })
  @IsString()
  @IsNotEmpty()
  unitOfMeasure!: string;
}

export class SetRecipeDto {
  @ApiPropertyOptional({
    description: "Recipe version display name",
    example: "Signature Espresso Standard Recipe",
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "List of ingredients required for this item",
    type: [RecipeIngredientDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients!: RecipeIngredientDto[];
}

export class CreateMenuItemDto {
  @ApiProperty({ description: "Menu item name", example: "Signature Espresso" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "Category UUID" })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ description: "Department preparation station UUID" })
  @IsUUID()
  @IsNotEmpty()
  departmentId!: string;

  @ApiPropertyOptional({
    description: "Description of the menu item",
    example: "Rich double shot of artisan espresso with thick crema",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Selling price in decimal string",
    example: "3.50",
  })
  @IsNumberString()
  @IsNotEmpty()
  price!: string;

  @ApiPropertyOptional({
    description: "Availability status",
    enum: ["AVAILABLE", "UNAVAILABLE"],
    default: "AVAILABLE",
  })
  @IsIn(["AVAILABLE", "UNAVAILABLE"])
  @IsOptional()
  availabilityStatus?: string = "AVAILABLE";

  @ApiPropertyOptional({
    description: "Optional initial recipe definition",
    type: SetRecipeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetRecipeDto)
  recipe?: SetRecipeDto;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional({ description: "Menu item name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: "Category UUID" })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Department preparation station UUID" })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: "Description of the menu item" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Selling price in decimal string",
    example: "3.50",
  })
  @IsNumberString()
  @IsOptional()
  price?: string;

  @ApiPropertyOptional({
    description: "Availability status",
    enum: ["AVAILABLE", "UNAVAILABLE"],
  })
  @IsIn(["AVAILABLE", "UNAVAILABLE"])
  @IsOptional()
  availabilityStatus?: string;
}

export class UpdateAvailabilityDto {
  @ApiProperty({
    description: "Availability status",
    enum: ["AVAILABLE", "UNAVAILABLE"],
  })
  @IsIn(["AVAILABLE", "UNAVAILABLE"])
  @IsNotEmpty()
  availabilityStatus!: string;
}

export class MenuItemQueryDto {
  @ApiPropertyOptional({ description: "Filter by category UUID" })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Filter by department UUID" })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: "Filter by availability status",
    enum: ["AVAILABLE", "UNAVAILABLE"],
  })
  @IsIn(["AVAILABLE", "UNAVAILABLE"])
  @IsOptional()
  availabilityStatus?: string;

  @ApiPropertyOptional({
    description: "Full-text search by name or description",
  })
  @IsString()
  @IsOptional()
  search?: string;
}
