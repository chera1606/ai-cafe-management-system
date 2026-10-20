import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { InventoryController } from "./controllers/inventory.controller";
import { InventoryService } from "./services/inventory.service";

@Module({
  imports: [DatabaseModule, AuditModule, AuthModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
