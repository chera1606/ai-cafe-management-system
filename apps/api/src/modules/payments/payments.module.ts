import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { OrdersModule } from "../orders/orders.module";
import { PaymentsController } from "./controllers/payments.controller";
import { PaymentsService } from "./services/payments.service";

@Module({
  imports: [DatabaseModule, OrdersModule, AuditModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
