import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { CreditController } from "./controllers/credit.controller";
import { CreditService } from "./services/credit.service";

@Module({
  imports: [DatabaseModule, AuditModule, AuthModule],
  controllers: [CreditController],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
