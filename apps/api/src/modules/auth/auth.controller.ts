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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Public } from "./decorators/public.decorator";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import {
  ForgotPasswordDto,
  RequestMagicLinkDto,
  ResetPasswordDto,
  VerifyMagicLinkDto,
} from "./dto/magic-link.dto";
import { OAuthLoginDto } from "./dto/oauth-login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import {
  TwoFactorAuthenticateDto,
  TwoFactorCodeDto,
} from "./dto/two-factor.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
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

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Register a new customer account" })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: "Login with email and password" })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const clientInfo = extractConnectionInfo(req);
    return this.authService.login(dto, clientInfo);
  }

  @ApiOperation({
    summary: "Complete 2FA login with TOTP code or recovery code",
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post("2fa/authenticate")
  @HttpCode(HttpStatus.OK)
  async authenticate2Fa(
    @Body() dto: TwoFactorAuthenticateDto,
    @Req() req: Request,
  ) {
    const clientInfo = extractConnectionInfo(req);
    return this.authService.authenticateWith2Fa(dto, clientInfo);
  }

  @ApiOperation({ summary: "Generate a TOTP secret and QR code for 2FA setup" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  @Post("2fa/generate")
  @HttpCode(HttpStatus.OK)
  async generate2Fa(@CurrentUser() user: JwtPayload) {
    return this.authService.generate2FaSecret(user.userId);
  }

  @ApiOperation({ summary: "Enable 2FA after verifying the TOTP code" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  @Post("2fa/enable")
  @HttpCode(HttpStatus.OK)
  async enable2Fa(
    @CurrentUser() user: JwtPayload,
    @Body() dto: TwoFactorCodeDto,
  ) {
    return this.authService.enable2Fa(user.userId, dto.code);
  }

  @ApiOperation({ summary: "Disable 2FA after verifying the TOTP code" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  @Post("2fa/disable")
  @HttpCode(HttpStatus.OK)
  async disable2Fa(
    @CurrentUser() user: JwtPayload,
    @Body() dto: TwoFactorCodeDto,
  ) {
    return this.authService.disable2Fa(user.userId, dto.code);
  }

  @ApiOperation({ summary: "Request a magic link sent to the email address" })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post("magic-link/request")
  @HttpCode(HttpStatus.OK)
  async requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    return this.authService.requestMagicLink(dto);
  }

  @ApiOperation({ summary: "Verify a magic link token and issue a session" })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post("magic-link/verify")
  @HttpCode(HttpStatus.OK)
  async verifyMagicLink(@Body() dto: VerifyMagicLinkDto, @Req() req: Request) {
    const clientInfo = extractConnectionInfo(req);
    return this.authService.verifyMagicLink(dto, clientInfo);
  }

  @ApiOperation({ summary: "Request a password reset link via email" })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @ApiOperation({
    summary: "Reset password using the token from the reset email",
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiOperation({
    summary: "Verify email address using the token from the welcome email",
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @ApiOperation({ summary: "Initiate Google OAuth2 login flow" })
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("google")
  async googleAuth() {
    // Passport redirects to Google
  }

  @ApiOperation({ summary: "Google OAuth2 callback — issues session tokens" })
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleAuthRedirect(@Req() req: Request) {
    const googleUser = req.user as OAuthLoginDto;
    const clientInfo = extractConnectionInfo(req);
    return this.authService.handleOAuthLogin(googleUser, clientInfo);
  }

  @ApiOperation({
    summary: "Submit Google OAuth profile to get session tokens",
  })
  @Public()
  @Post("oauth/login")
  @HttpCode(HttpStatus.OK)
  async oauthLogin(@Body() dto: OAuthLoginDto, @Req() req: Request) {
    const clientInfo = extractConnectionInfo(req);
    return this.authService.handleOAuthLogin(dto, clientInfo);
  }

  @ApiOperation({ summary: "Rotate refresh token and get a new access token" })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const clientInfo = extractConnectionInfo(req);
    return this.authService.refreshTokens(dto, clientInfo);
  }

  @ApiOperation({
    summary: "Logout — revoke the current refresh token session",
  })
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: Partial<RefreshTokenDto>) {
    return this.authService.logout(dto.refreshToken);
  }

  @ApiOperation({ summary: "List all active sessions for the current user" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  @Get("sessions")
  @HttpCode(HttpStatus.OK)
  async getSessions(@CurrentUser() user: JwtPayload) {
    return this.authService.getUserSessions(user.userId);
  }

  @ApiOperation({ summary: "Revoke a specific session by ID" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  @Delete("sessions/:id")
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @CurrentUser() user: JwtPayload,
    @Param("id") sessionId: string,
  ) {
    return this.authService.revokeSession(user.userId, sessionId);
  }

  @ApiOperation({ summary: "Logout from all devices — revoke all sessions" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: JwtPayload) {
    return this.authService.revokeAllSessions(user.userId);
  }

  @ApiOperation({ summary: "Get the current authenticated user profile" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  @Get("me")
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.userId);
  }

  @ApiOperation({ summary: "Change password for the authenticated user" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }
}
