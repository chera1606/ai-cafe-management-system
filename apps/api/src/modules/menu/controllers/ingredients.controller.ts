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
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  CreateIngredientDto,
  IngredientQueryDto,
  UpdateIngredientDto,
} from "../dto/ingredient.dto";
import { IngredientsService } from "../services/ingredients.service";

@ApiTags("menu-ingredients")
@ApiBearerAuth("access-token")
@Controller("menu/ingredients")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "MANAGER")
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @ApiOperation({ summary: "List raw ingredients" })
  @ApiResponse({ status: 200, description: "List of ingredients returned" })
  @Get()
  async findAll(@Query() query: IngredientQueryDto) {
    return this.ingredientsService.findAll(query);
  }

  @ApiOperation({ summary: "Get ingredient details by ID" })
  @ApiResponse({ status: 200, description: "Ingredient found" })
  @ApiResponse({ status: 404, description: "Ingredient not found" })
  @Get(":id")
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.ingredientsService.findById(id);
  }

  @ApiOperation({ summary: "Create a new raw ingredient" })
  @ApiResponse({ status: 201, description: "Ingredient created successfully" })
  @Post()
  async create(@Body() dto: CreateIngredientDto) {
    return this.ingredientsService.create(dto);
  }

  @ApiOperation({ summary: "Update ingredient details" })
  @ApiResponse({ status: 200, description: "Ingredient updated successfully" })
  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, dto);
  }

  @ApiOperation({ summary: "Delete an ingredient" })
  @ApiResponse({ status: 200, description: "Ingredient deleted" })
  @Delete(":id")
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    return this.ingredientsService.delete(id);
  }
}
