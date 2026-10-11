import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
  CreateMenuItemDto,
  MenuItemQueryDto,
  SetRecipeDto,
  UpdateAvailabilityDto,
  UpdateMenuItemDto,
} from "../dto/menu-item.dto";
import { MenuItemsService } from "../services/menu-items.service";

@ApiTags("menu-items")
@Controller("menu/items")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @ApiOperation({
    summary:
      "Public list of menu items with optional category, department, availability, and search filters",
  })
  @ApiResponse({ status: 200, description: "List of menu items returned" })
  @Public()
  @Get()
  async findAll(@Query() query: MenuItemQueryDto) {
    return this.menuItemsService.findAll(query);
  }

  @ApiOperation({
    summary:
      "Public get single menu item details with active recipe and ingredients",
  })
  @ApiResponse({ status: 200, description: "Menu item details returned" })
  @ApiResponse({ status: 404, description: "Menu item not found" })
  @Public()
  @Get(":id")
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.menuItemsService.findById(id);
  }

  @ApiOperation({ summary: "Create a new menu item (Admin & Manager)" })
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 201, description: "Menu item created successfully" })
  @Roles("ADMIN", "MANAGER")
  @Post()
  async create(@Body() dto: CreateMenuItemDto) {
    return this.menuItemsService.create(dto);
  }

  @ApiOperation({ summary: "Update menu item details (Admin & Manager)" })
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 200, description: "Menu item updated successfully" })
  @Roles("ADMIN", "MANAGER")
  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(id, dto);
  }

  @ApiOperation({
    summary: "Toggle menu item availability status (Admin & Manager)",
  })
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 200, description: "Availability updated" })
  @Roles("ADMIN", "MANAGER")
  @Patch(":id/availability")
  async updateAvailability(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.menuItemsService.updateAvailability(id, dto.availabilityStatus);
  }

  @ApiOperation({ summary: "Delete a menu item and its recipe history" })
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 200, description: "Menu item deleted" })
  @Roles("ADMIN", "MANAGER")
  @Delete(":id")
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    return this.menuItemsService.delete(id);
  }

  @ApiOperation({
    summary:
      "Set or update recipe for a menu item with new version (Admin & Manager)",
  })
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 200, description: "Recipe configured successfully" })
  @Roles("ADMIN", "MANAGER")
  @Put(":id/recipe")
  async setRecipe(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SetRecipeDto,
  ) {
    return this.menuItemsService.setRecipe(id, dto);
  }

  @ApiOperation({
    summary: "Set recipe alternative POST endpoint (Admin & Manager)",
  })
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 200, description: "Recipe configured successfully" })
  @Roles("ADMIN", "MANAGER")
  @Post(":id/recipe")
  async setRecipePost(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SetRecipeDto,
  ) {
    return this.menuItemsService.setRecipe(id, dto);
  }
}
