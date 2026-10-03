import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);
  const nodeEnv = configService.get<string>("NODE_ENV", "development");

  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Swagger / OpenAPI ──────────────────────────────────────────────────────
  if (nodeEnv !== "test") {
    const config = new DocumentBuilder()
      .setTitle("AI Cafe Management API")
      .setDescription(
        "Complete REST API for the AI Cafe Management System — authentication, orders, inventory, staff, and more.",
      )
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
        "access-token",
      )
      .addTag("auth", "Authentication — register, login, 2FA, OAuth, sessions")
      .addTag("health", "Health check")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/v1/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: "alpha",
        operationsSorter: "alpha",
      },
    });

    logger.log(
      `Swagger docs available on http://localhost:${port}/api/v1/docs`,
    );
  }

  await app.listen(port);
  logger.log(
    `Application running on http://localhost:${port}/api/v1 [${nodeEnv}]`,
  );
  logger.log(
    `Health check available on http://localhost:${port}/api/v1/health`,
  );
}
bootstrap();
