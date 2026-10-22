import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { InventoryModule } from "../inventory/inventory.module";
import { ProcurementController } from "./controllers/procurement.controller";
import { ProcurementService } from "./services/procurement.service";

@Module({
  imports: [DatabaseModule, AuditModule, AuthModule, InventoryModule],
  controllers: [ProcurementController],
  providers: [ProcurementService],
  exports: [ProcurementService],
})
export class ProcurementModule {}
