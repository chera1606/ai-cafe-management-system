import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { CategoriesController } from "./controllers/categories.controller";
import { DepartmentsController } from "./controllers/departments.controller";
import { IngredientsController } from "./controllers/ingredients.controller";
import { MenuItemsController } from "./controllers/menu-items.controller";
import { CategoriesService } from "./services/categories.service";
import { DepartmentsService } from "./services/departments.service";
import { IngredientsService } from "./services/ingredients.service";
import { MenuItemsService } from "./services/menu-items.service";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    CategoriesController,
    DepartmentsController,
    IngredientsController,
    MenuItemsController,
  ],
  providers: [
    CategoriesService,
    DepartmentsService,
    IngredientsService,
    MenuItemsService,
  ],
  exports: [
    CategoriesService,
    DepartmentsService,
    IngredientsService,
    MenuItemsService,
  ],
})
export class MenuModule {}
