import { customers, type Database, roles, userRoles, users } from "@cafe/db";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import { DATABASE_TOKEN } from "../database/database.constants";
import { UsersService } from "../users/users.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";
import type { JwtPayload } from "./interfaces/jwt-payload.interface";
import { comparePassword, hashPassword } from "./utils/password.util";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user || user.status !== "active") {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
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

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        roles: userRolesList,
        permissions: userPermsList,
      },
    };
  }

  async getProfile(userId: string) {
    const profile = await this.usersService.getUserProfile(userId);
    if (!profile) {
      throw new NotFoundException("User profile not found");
    }
    return profile;
  }
}
