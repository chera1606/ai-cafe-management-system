import {
  customers,
  type Database,
  magicLinks,
  oauthAccounts,
  roles,
  userRoles,
  userSessions,
  users,
} from "@cafe/db";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { and, desc, eq, gt } from "drizzle-orm";
import { AuditService } from "../audit/audit.service";
import { DATABASE_TOKEN } from "../database/database.constants";
import { UsersService } from "../users/users.service";
import type { LoginDto } from "./dto/login.dto";
import type {
  ForgotPasswordDto,
  RequestMagicLinkDto,
  ResetPasswordDto,
  VerifyMagicLinkDto,
} from "./dto/magic-link.dto";
import type { OAuthLoginDto } from "./dto/oauth-login.dto";
import type { RefreshTokenDto } from "./dto/refresh-token.dto";
import type { RegisterDto } from "./dto/register.dto";
import type { TwoFactorAuthenticateDto } from "./dto/two-factor.dto";
import type { JwtPayload } from "./interfaces/jwt-payload.interface";
import type {
  ClientConnectionInfo,
  UserSessionResponse,
} from "./interfaces/session.interface";
import { TwoFactorService } from "./services/two-factor.service";
import { comparePassword, hashPassword } from "./utils/password.util";
import { generateRandomToken, hashToken } from "./utils/token.util";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_DAYS = 7;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const MAGIC_LINK_EXPIRY_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException(
        "User with this email address already exists",
      );
    }

    const hashedPassword = await hashPassword(dto.password);

    const result = await this.db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(users)
        .values({
          email: normalizedEmail,
          passwordHash: hashedPassword,
          status: "active",
        })
        .returning();

      if (!insertedUser) {
        throw new Error("Failed to insert user record");
      }

      const [insertedCustomer] = await tx
        .insert(customers)
        .values({
          userId: insertedUser.id,
          name: dto.name.trim(),
          email: normalizedEmail,
          phone: dto.phone?.trim() || null,
          status: "active",
        })
        .returning();

      if (!insertedCustomer) {
        throw new Error("Failed to insert customer record");
      }

      const customerRole = await tx
        .select()
        .from(roles)
        .where(eq(roles.name, "customer"))
        .limit(1);

      if (customerRole[0]) {
        await tx.insert(userRoles).values({
          userId: insertedUser.id,
          roleId: customerRole[0].id,
        });
      }

      return {
        user: insertedUser,
        customer: insertedCustomer,
      };
    });

    await this.auditService.record({
      actorUserId: result.user.id,
      action: "AUTH_USER_REGISTERED",
      entityType: "users",
      entityId: result.user.id,
      newState: { email: result.user.email },
    });

    const { roles: userRolesList, permissions: userPermsList } =
      await this.usersService.getUserRolesAndPermissions(result.user.id);

    return {
      message: "User registered successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
        status: result.user.status,
        createdAt: result.user.createdAt,
        roles: userRolesList,
        permissions: userPermsList,
        customer: {
          id: result.customer.id,
          name: result.customer.name,
          phone: result.customer.phone,
          email: result.customer.email,
          status: result.customer.status,
        },
      },
    };
  }

  async login(dto: LoginDto, clientInfo?: ClientConnectionInfo) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user || user.status !== "active") {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Check account lockout status
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMinutes = Math.max(
        1,
        Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000),
      );
      throw new UnauthorizedException(
        `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      );
    }

    const isPasswordValid = await comparePassword(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
      const lockUntil = shouldLock
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

      await this.db
        .update(users)
        .set({
          failedLoginAttempts: attempts,
          lockedUntil: lockUntil,
        })
        .where(eq(users.id, user.id));

      await this.auditService.record({
        actorUserId: user.id,
        action: shouldLock ? "AUTH_ACCOUNT_LOCKED" : "AUTH_LOGIN_FAILED",
        entityType: "users",
        entityId: user.id,
        newState: { attempts, locked: shouldLock },
      });

      if (shouldLock) {
        throw new UnauthorizedException(
          `Account has been temporarily locked for ${LOCKOUT_MINUTES} minutes due to 5 consecutive failed login attempts.`,
        );
      }

      throw new UnauthorizedException("Invalid email or password");
    }

    // Two-factor authentication required?
    if (user.twoFactorEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: user.id, is2faPending: true },
        { expiresIn: "5m" },
      );

      return {
        requires2fa: true,
        tempToken,
      };
    }

    // Successful login: reset failed attempts if any
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.db
        .update(users)
        .set({
          failedLoginAttempts: 0,
          lockedUntil: null,
        })
        .where(eq(users.id, user.id));
    }

    await this.auditService.record({
      actorUserId: user.id,
      action: "AUTH_LOGIN_SUCCESS",
      entityType: "users",
      entityId: user.id,
      newState: {
        ipAddress: clientInfo?.ipAddress,
        device: clientInfo?.device,
      },
    });

    return this.issueSessionTokens(user.id, user.email, clientInfo);
  }

  async generate2FaSecret(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const { secret, qrCodeUrl } = await this.twoFactorService.generateSecret(
      user.email,
    );

    await this.db
      .update(users)
      .set({ twoFactorSecret: secret })
      .where(eq(users.id, userId));

    return { secret, qrCodeUrl };
  }

  async enable2Fa(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException(
        "Please generate a 2FA secret before enabling 2FA",
      );
    }

    const isValid = this.twoFactorService.verifyToken(
      code,
      user.twoFactorSecret,
    );
    if (!isValid) {
      throw new UnauthorizedException("Invalid two-factor authentication code");
    }

    const { rawCodes, hashedCodes } =
      this.twoFactorService.generateRecoveryCodes(8);

    await this.db
      .update(users)
      .set({
        twoFactorEnabled: true,
        twoFactorRecoveryCodes: hashedCodes,
      })
      .where(eq(users.id, userId));

    await this.auditService.record({
      actorUserId: userId,
      action: "AUTH_2FA_ENABLED",
      entityType: "users",
      entityId: userId,
    });

    return {
      message: "Two-factor authentication enabled successfully",
      recoveryCodes: rawCodes,
    };
  }

  async disable2Fa(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException("2FA is not currently enabled");
    }

    const isValid = this.twoFactorService.verifyToken(
      code,
      user.twoFactorSecret,
    );
    if (!isValid) {
      throw new UnauthorizedException("Invalid two-factor authentication code");
    }

    await this.db
      .update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: null,
      })
      .where(eq(users.id, userId));

    await this.auditService.record({
      actorUserId: userId,
      action: "AUTH_2FA_DISABLED",
      entityType: "users",
      entityId: userId,
    });

    return { message: "Two-factor authentication disabled successfully" };
  }

  async authenticateWith2Fa(
    dto: TwoFactorAuthenticateDto,
    clientInfo?: ClientConnectionInfo,
  ) {
    let decoded: { sub: string; is2faPending?: boolean };
    try {
      decoded = this.jwtService.verify(dto.tempToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired 2FA session token");
    }

    if (!decoded.is2faPending || !decoded.sub) {
      throw new UnauthorizedException("Invalid 2FA session token");
    }

    const user = await this.usersService.findById(decoded.sub);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException("2FA authentication is not available");
    }

    let isValid = this.twoFactorService.verifyToken(
      dto.code,
      user.twoFactorSecret,
    );
    let usedRecoveryCodeHash: string | null = null;

    if (!isValid && user.twoFactorRecoveryCodes) {
      const inputHash = hashToken(dto.code.trim());
      const recoveryList = (user.twoFactorRecoveryCodes as string[]) || [];

      if (recoveryList.includes(inputHash)) {
        isValid = true;
        usedRecoveryCodeHash = inputHash;
      }
    }

    if (!isValid) {
      throw new UnauthorizedException(
        "Invalid two-factor code or recovery code",
      );
    }

    // If recovery code was used, remove it from list
    if (usedRecoveryCodeHash && user.twoFactorRecoveryCodes) {
      const remainingCodes = (user.twoFactorRecoveryCodes as string[]).filter(
        (c) => c !== usedRecoveryCodeHash,
      );

      await this.db
        .update(users)
        .set({ twoFactorRecoveryCodes: remainingCodes })
        .where(eq(users.id, user.id));
    }

    // Reset lockout counters on success
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.db
        .update(users)
        .set({
          failedLoginAttempts: 0,
          lockedUntil: null,
        })
        .where(eq(users.id, user.id));
    }

    await this.auditService.record({
      actorUserId: user.id,
      action: usedRecoveryCodeHash
        ? "AUTH_LOGIN_RECOVERY_CODE_SUCCESS"
        : "AUTH_LOGIN_2FA_SUCCESS",
      entityType: "users",
      entityId: user.id,
    });

    return this.issueSessionTokens(user.id, user.email, clientInfo);
  }

  async requestMagicLink(dto: RequestMagicLinkDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    let user = await this.usersService.findByEmail(normalizedEmail);

    // If customer doesn't exist, create account on the fly for frictionless UX
    if (!user) {
      const randomPassword = await hashPassword(generateRandomToken(32));
      const result = await this.db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(users)
          .values({
            email: normalizedEmail,
            passwordHash: randomPassword,
            status: "active",
          })
          .returning();

        if (!newUser) throw new Error("Failed to create user");

        await tx.insert(customers).values({
          userId: newUser.id,
          name: normalizedEmail.split("@")[0] || "Customer",
          email: normalizedEmail,
          status: "active",
        });

        const customerRole = await tx
          .select()
          .from(roles)
          .where(eq(roles.name, "customer"))
          .limit(1);

        if (customerRole[0]) {
          await tx.insert(userRoles).values({
            userId: newUser.id,
            roleId: customerRole[0].id,
          });
        }

        return newUser;
      });
      user = result ?? null;
    }

    if (!user) {
      throw new InternalServerErrorException("User creation failed");
    }

    const rawToken = generateRandomToken(40);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000,
    );

    await this.db.insert(magicLinks).values({
      userId: user.id,
      tokenHash,
      type: "magic_link",
      expiresAt,
    });

    await this.auditService.record({
      actorUserId: user.id,
      action: "AUTH_MAGIC_LINK_REQUESTED",
      entityType: "magic_links",
    });

    return {
      message: "Magic login link generated successfully",
      token: rawToken,
    };
  }

  async verifyMagicLink(
    dto: VerifyMagicLinkDto,
    clientInfo?: ClientConnectionInfo,
  ) {
    const tokenHash = hashToken(dto.token);

    const [link] = await this.db
      .select()
      .from(magicLinks)
      .where(
        and(
          eq(magicLinks.tokenHash, tokenHash),
          eq(magicLinks.type, "magic_link"),
          gt(magicLinks.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!link || link.usedAt) {
      throw new UnauthorizedException("Invalid or expired magic link");
    }

    await this.db
      .update(magicLinks)
      .set({ usedAt: new Date() })
      .where(eq(magicLinks.id, link.id));

    const user = await this.usersService.findById(link.userId);
    if (!user || user.status !== "active") {
      throw new UnauthorizedException("Account is disabled or does not exist");
    }

    await this.auditService.record({
      actorUserId: user.id,
      action: "AUTH_MAGIC_LINK_SUCCESS",
      entityType: "users",
      entityId: user.id,
    });

    return this.issueSessionTokens(user.id, user.email, clientInfo);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (user && user.status === "active") {
      const rawToken = generateRandomToken(40);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await this.db.insert(magicLinks).values({
        userId: user.id,
        tokenHash,
        type: "password_reset",
        expiresAt,
      });

      await this.auditService.record({
        actorUserId: user.id,
        action: "AUTH_PASSWORD_RESET_REQUESTED",
        entityType: "users",
        entityId: user.id,
      });
    }

    return {
      message:
        "If an account exists with this email address, a password reset link has been dispatched.",
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashToken(dto.token);

    const [link] = await this.db
      .select()
      .from(magicLinks)
      .where(
        and(
          eq(magicLinks.tokenHash, tokenHash),
          eq(magicLinks.type, "password_reset"),
          gt(magicLinks.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!link || link.usedAt) {
      throw new UnauthorizedException(
        "Invalid or expired password reset token",
      );
    }

    const hashedPassword = await hashPassword(dto.newPassword);

    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          passwordHash: hashedPassword,
          failedLoginAttempts: 0,
          lockedUntil: null,
        })
        .where(eq(users.id, link.userId));

      await tx
        .update(magicLinks)
        .set({ usedAt: new Date() })
        .where(eq(magicLinks.id, link.id));

      // Revoke all existing sessions for security
      await tx
        .update(userSessions)
        .set({ isRevoked: true })
        .where(eq(userSessions.userId, link.userId));
    });

    await this.auditService.record({
      actorUserId: link.userId,
      action: "AUTH_PASSWORD_RESET_SUCCESS",
      entityType: "users",
      entityId: link.userId,
    });

    return {
      message:
        "Password has been reset successfully. Please log in with your new password.",
    };
  }

  async handleOAuthLogin(
    dto: OAuthLoginDto,
    clientInfo?: ClientConnectionInfo,
  ) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check if OAuth account link exists
    const [existingOAuth] = await this.db
      .select()
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, dto.provider),
          eq(oauthAccounts.providerUserId, dto.providerUserId),
        ),
      )
      .limit(1);

    let userId: string;

    if (existingOAuth) {
      userId = existingOAuth.userId;
    } else {
      // Check if user with this email already exists
      const existingUser = await this.usersService.findByEmail(normalizedEmail);

      if (existingUser) {
        userId = existingUser.id;
        await this.db.insert(oauthAccounts).values({
          userId: existingUser.id,
          provider: dto.provider,
          providerUserId: dto.providerUserId,
        });
      } else {
        // Create user, customer, and oauth link in transaction
        const randomPassword = await hashPassword(generateRandomToken(32));
        const createdUser = await this.db.transaction(async (tx) => {
          const [newUser] = await tx
            .insert(users)
            .values({
              email: normalizedEmail,
              passwordHash: randomPassword,
              status: "active",
            })
            .returning();

          if (!newUser) throw new Error("Failed to create user");

          await tx.insert(customers).values({
            userId: newUser.id,
            name: dto.name.trim(),
            email: normalizedEmail,
            status: "active",
          });

          await tx.insert(oauthAccounts).values({
            userId: newUser.id,
            provider: dto.provider,
            providerUserId: dto.providerUserId,
          });

          const customerRole = await tx
            .select()
            .from(roles)
            .where(eq(roles.name, "customer"))
            .limit(1);

          if (customerRole[0]) {
            await tx.insert(userRoles).values({
              userId: newUser.id,
              roleId: customerRole[0].id,
            });
          }

          return newUser;
        });

        if (!createdUser)
          throw new InternalServerErrorException("User creation failed");
        userId = createdUser.id;
      }
    }

    await this.auditService.record({
      actorUserId: userId,
      action: "AUTH_OAUTH_LOGIN_SUCCESS",
      entityType: "users",
      entityId: userId,
      newState: { provider: dto.provider },
    });

    return this.issueSessionTokens(userId, normalizedEmail, clientInfo);
  }

  private async issueSessionTokens(
    userId: string,
    email: string,
    clientInfo?: ClientConnectionInfo,
  ) {
    const { roles: userRolesList, permissions: userPermsList } =
      await this.usersService.getUserRolesAndPermissions(userId);

    const payload: JwtPayload = {
      sub: userId,
      userId,
      email,
      roles: userRolesList,
      permissions: userPermsList,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const rawRefreshToken = generateRandomToken(40);
    const hashedRefreshToken = hashToken(rawRefreshToken);
    const refreshExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    );

    const [session] = await this.db
      .insert(userSessions)
      .values({
        userId,
        refreshTokenHash: hashedRefreshToken,
        device: clientInfo?.device || "Desktop Browser",
        ipAddress: clientInfo?.ipAddress || "Unknown IP",
        userAgent: clientInfo?.userAgent || null,
        expiresAt: refreshExpiresAt,
      })
      .returning();

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      sessionId: session?.id,
      user: {
        id: userId,
        email,
        status: "active",
        roles: userRolesList,
        permissions: userPermsList,
      },
    };
  }

  async refreshTokens(dto: RefreshTokenDto, clientInfo?: ClientConnectionInfo) {
    const tokenHash = hashToken(dto.refreshToken);

    const [session] = await this.db
      .select()
      .from(userSessions)
      .where(eq(userSessions.refreshTokenHash, tokenHash))
      .limit(1);

    if (!session) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Token reuse detection: if revoked or already replaced, revoke all user sessions
    if (session.isRevoked || session.replacedBySessionId) {
      await this.db
        .update(userSessions)
        .set({ isRevoked: true })
        .where(eq(userSessions.userId, session.userId));

      await this.auditService.record({
        actorUserId: session.userId,
        action: "AUTH_TOKEN_THEFT_DETECTED",
        entityType: "user_sessions",
        entityId: session.id,
      });

      throw new UnauthorizedException(
        "Security alert: Refresh token reuse detected. All active sessions have been revoked.",
      );
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException(
        "Refresh token has expired. Please log in again.",
      );
    }

    const user = await this.usersService.findById(session.userId);
    if (!user || user.status !== "active") {
      throw new UnauthorizedException(
        "Account is inactive or no longer exists.",
      );
    }

    const { roles: userRolesList, permissions: userPermsList } =
      await this.usersService.getUserRolesAndPermissions(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      roles: userRolesList,
      permissions: userPermsList,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const newRefreshToken = generateRandomToken(40);
    const newHashedToken = hashToken(newRefreshToken);
    const newExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.db.transaction(async (tx) => {
      const [newSession] = await tx
        .insert(userSessions)
        .values({
          userId: user.id,
          refreshTokenHash: newHashedToken,
          device: clientInfo?.device || session.device,
          ipAddress: clientInfo?.ipAddress || session.ipAddress,
          userAgent: clientInfo?.userAgent || session.userAgent,
          expiresAt: newExpiresAt,
        })
        .returning();

      if (!newSession) {
        throw new Error("Failed to create rotated session record");
      }

      await tx
        .update(userSessions)
        .set({
          isRevoked: true,
          replacedBySessionId: newSession.id,
          lastActiveAt: new Date(),
        })
        .where(eq(userSessions.id, session.id));
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await this.db
        .update(userSessions)
        .set({ isRevoked: true })
        .where(eq(userSessions.refreshTokenHash, tokenHash));
    }

    return { message: "Logged out successfully" };
  }

  async getUserSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<UserSessionResponse[]> {
    const activeSessions = await this.db
      .select({
        id: userSessions.id,
        device: userSessions.device,
        ipAddress: userSessions.ipAddress,
        userAgent: userSessions.userAgent,
        createdAt: userSessions.createdAt,
        lastActiveAt: userSessions.lastActiveAt,
        expiresAt: userSessions.expiresAt,
      })
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.isRevoked, false),
          gt(userSessions.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(userSessions.lastActiveAt));

    return activeSessions.map((s) => ({
      ...s,
      isCurrentSession: currentSessionId ? s.id === currentSessionId : false,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const [existing] = await this.db
      .select({ id: userSessions.id })
      .from(userSessions)
      .where(
        and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)),
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException("Active session not found");
    }

    await this.db
      .update(userSessions)
      .set({ isRevoked: true })
      .where(eq(userSessions.id, sessionId));

    await this.auditService.record({
      actorUserId: userId,
      action: "AUTH_SESSION_REVOKED",
      entityType: "user_sessions",
      entityId: sessionId,
    });

    return { message: "Session revoked successfully" };
  }

  async revokeAllSessions(userId: string) {
    await this.db
      .update(userSessions)
      .set({ isRevoked: true })
      .where(eq(userSessions.userId, userId));

    await this.auditService.record({
      actorUserId: userId,
      action: "AUTH_ALL_SESSIONS_REVOKED",
      entityType: "user_sessions",
    });

    return { message: "All sessions have been revoked successfully" };
  }

  async getProfile(userId: string) {
    const profile = await this.usersService.getUserProfile(userId);
    if (!profile) {
      throw new NotFoundException("User profile not found");
    }
    return profile;
  }
}
