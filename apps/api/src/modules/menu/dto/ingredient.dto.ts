import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateIngredientDto {
  @ApiProperty({ description: "Ingredient name", example: "Arabica Beans" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "Unit of measurement (e.g., g, ml, pcs, kg, oz)",
    example: "g",
  })
  @IsString()
  @IsNotEmpty()
  unitOfMeasure!: string;

  @ApiPropertyOptional({
    description: "Ingredient status",
    enum: ["active", "inactive"],
    default: "active",
  })
  @IsIn(["active", "inactive"])
  @IsOptional()
  status?: string = "active";
}

export class UpdateIngredientDto {
  @ApiPropertyOptional({ description: "Ingredient name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: "Unit of measurement (e.g., g, ml, pcs, kg, oz)",
  })
  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @ApiPropertyOptional({
    description: "Ingredient status",
    enum: ["active", "inactive"],
  })
  @IsIn(["active", "inactive"])
  @IsOptional()
  status?: string;
}

export class IngredientQueryDto {
  @ApiPropertyOptional({
    description: "Filter by status",
    enum: ["active", "inactive"],
  })
  @IsIn(["active", "inactive"])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: "Search by ingredient name" })
  @IsString()
  @IsOptional()
  search?: string;
}
