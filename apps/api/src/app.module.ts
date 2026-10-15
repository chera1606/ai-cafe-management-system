import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { validateEnv } from "./common/config/env.schema";
import { HealthModule } from "./health/health.module";
import { AuditModule } from "./modules/audit";
import { AuthModule } from "./modules/auth/auth.module";
import { DatabaseModule } from "./modules/database";
import { MenuModule } from "./modules/menu";
import { OrdersModule } from "./modules/orders";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env", "../.env"],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    DatabaseModule,
    AuditModule,
    UsersModule,
    AuthModule,
    MenuModule,
    OrdersModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
