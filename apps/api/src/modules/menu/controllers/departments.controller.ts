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
  CreateDepartmentDto,
  DepartmentQueryDto,
  UpdateDepartmentDto,
} from "../dto/department.dto";
import { DepartmentsService } from "../services/departments.service";

@ApiTags("menu-departments")
@ApiBearerAuth("access-token")
@Controller("menu/departments")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "MANAGER")
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @ApiOperation({ summary: "List preparation station departments" })
  @ApiResponse({ status: 200, description: "List of departments returned" })
  @Get()
  async findAll(@Query() query: DepartmentQueryDto) {
    return this.departmentsService.findAll(query);
  }

  @ApiOperation({ summary: "Get department details by ID" })
  @ApiResponse({ status: 200, description: "Department found" })
  @ApiResponse({ status: 404, description: "Department not found" })
  @Get(":id")
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.departmentsService.findById(id);
  }

  @ApiOperation({ summary: "Create a new department station" })
  @ApiResponse({ status: 201, description: "Department created successfully" })
  @Post()
  async create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @ApiOperation({ summary: "Update department details" })
  @ApiResponse({ status: 200, description: "Department updated successfully" })
  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, dto);
  }

  @ApiOperation({ summary: "Delete a department station" })
  @ApiResponse({ status: 200, description: "Department deleted" })
  @Delete(":id")
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    return this.departmentsService.delete(id);
  }
}
