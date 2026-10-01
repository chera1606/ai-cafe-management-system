import { createDatabaseClient, type Database } from "@cafe/db";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DATABASE_TOKEN } from "./database.constants";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Database => {
        const databaseUrl = configService.getOrThrow<string>("DATABASE_URL");
        return createDatabaseClient(databaseUrl);
      },
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
