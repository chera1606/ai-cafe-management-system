import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Public } from "../../auth/decorators/public.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryStatusDto,
} from "../dto/category.dto";
import { CategoriesService } from "../services/categories.service";

@ApiTags("menu-categories")
@Controller("menu/categories")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: "List categories (public or filtered by status)" })
  @ApiResponse({ status: 200, description: "Returns list of categories" })
  @Public()
  @Get()
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @ApiOperation({ summary: "Get category details by ID" })
  @ApiResponse({ status: 200, description: "Category found" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @Public()
  @Get(":id")
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.categoriesService.findById(id);
  }

  @ApiOperation({ summary: "Create a new category (Admin & Manager)" })
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 201, description: "Category created successfully" })
  @Roles("ADMIN", "MANAGER")
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiOperation({ summary: "Update category details (Admin & Manager)" })
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 200, description: "Category updated successfully" })
  @Roles("ADMIN", "MANAGER")
  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @ApiOperation({
    summary: "Toggle or change category status (Admin & Manager)",
  })
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 200, description: "Category status updated" })
  @Roles("ADMIN", "MANAGER")
  @Patch(":id/status")
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryStatusDto,
  ) {
    return this.categoriesService.updateStatus(id, dto.status);
  }

  @ApiOperation({ summary: "Delete a category (Admin & Manager)" })
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 200, description: "Category deleted" })
  @Roles("ADMIN", "MANAGER")
  @Delete(":id")
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    return this.categoriesService.delete(id);
  }
}
