import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDepartmentDto {
  @ApiProperty({ description: "Department name", example: "Espresso Bar" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: "Department preparation station details",
    example: "Hot coffee and espresso extraction bar",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Department operational status",
    enum: ["active", "inactive"],
    default: "active",
  })
  @IsIn(["active", "inactive"])
  @IsOptional()
  status?: string = "active";
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ description: "Department name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: "Department preparation station details",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Department operational status",
    enum: ["active", "inactive"],
  })
  @IsIn(["active", "inactive"])
  @IsOptional()
  status?: string;
}

export class DepartmentQueryDto {
  @ApiPropertyOptional({
    description: "Filter by status",
    enum: ["active", "inactive"],
  })
  @IsIn(["active", "inactive"])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: "Search by department name" })
  @IsString()
  @IsOptional()
  search?: string;
}
