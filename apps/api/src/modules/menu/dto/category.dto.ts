import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({
    description: "Category display name",
    example: "Signature Espresso",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: "Detailed description of the category",
    example: "Artisan espresso handcrafted with premium beans",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Status of the category",
    enum: ["active", "inactive"],
    default: "active",
  })
  @IsIn(["active", "inactive"])
  @IsOptional()
  status?: string = "active";
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: "Category display name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: "Detailed description of the category" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Status of the category",
    enum: ["active", "inactive"],
  })
  @IsIn(["active", "inactive"])
  @IsOptional()
  status?: string;
}

export class UpdateCategoryStatusDto {
  @ApiProperty({
    description: "New status of the category",
    enum: ["active", "inactive"],
  })
  @IsIn(["active", "inactive"])
  @IsNotEmpty()
  status!: string;
}

export class CategoryQueryDto {
  @ApiPropertyOptional({
    description: "Filter by status",
    enum: ["active", "inactive"],
  })
  @IsIn(["active", "inactive"])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: "Search by category name" })
  @IsString()
  @IsOptional()
  search?: string;
}
