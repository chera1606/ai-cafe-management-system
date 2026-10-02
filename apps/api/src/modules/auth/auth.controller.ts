import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Public } from "./decorators/public.decorator";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { JwtPayload } from "./interfaces/jwt-payload.interface";
import type { ClientConnectionInfo } from "./interfaces/session.interface";
import { parseClientInfo } from "./utils/token.util";

function extractConnectionInfo(req: Request): ClientConnectionInfo {
  const userAgent = req.headers["user-agent"] as string | undefined;
  const ip =
    (req.headers["x-forwarded-for"] as string) ||
    req.ip ||
    req.socket.remoteAddress ||
    "Unknown IP";

  return parseClientInfo(userAgent, ip);
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const clientInfo = extractConnectionInfo(req);
    return this.authService.login(dto, clientInfo);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const clientInfo = extractConnectionInfo(req);
    return this.authService.refreshTokens(dto, clientInfo);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: Partial<RefreshTokenDto>) {
    return this.authService.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("sessions")
  @HttpCode(HttpStatus.OK)
  async getSessions(@CurrentUser() user: JwtPayload) {
    return this.authService.getUserSessions(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("sessions/:id")
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @CurrentUser() user: JwtPayload,
    @Param("id") sessionId: string,
  ) {
    return this.authService.revokeSession(user.userId, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: JwtPayload) {
    return this.authService.revokeAllSessions(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.userId);
  }
}
