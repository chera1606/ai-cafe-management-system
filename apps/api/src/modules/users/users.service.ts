import {
  customers,
  type Database,
  employees,
  permissions,
  rolePermissions,
  roles,
  userRoles,
  users,
} from "@cafe/db";
import { Inject, Injectable } from "@nestjs/common";
import { eq, inArray } from "drizzle-orm";
import type { UserProfileResponse } from "../auth/interfaces/jwt-payload.interface";
import { DATABASE_TOKEN } from "../database/database.constants";

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    return result[0] || null;
  }

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async getUserRolesAndPermissions(
    userId: string,
  ): Promise<{ roles: string[]; permissions: string[] }> {
    const userRoleRecords = await this.db
      .select({
        roleId: roles.id,
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    const roleNames = userRoleRecords.map((r) => r.roleName);
    const roleIds = userRoleRecords.map((r) => r.roleId);

    let permissionNames: string[] = [];
    if (roleIds.length > 0) {
      const permRecords = await this.db
        .select({
          permissionName: permissions.name,
        })
        .from(rolePermissions)
        .innerJoin(
          permissions,
          eq(rolePermissions.permissionId, permissions.id),
        )
        .where(inArray(rolePermissions.roleId, roleIds));

      permissionNames = Array.from(
        new Set(permRecords.map((p) => p.permissionName)),
      );
    }

    return {
      roles: roleNames,
      permissions: permissionNames,
    };
  }

  async getUserProfile(userId: string): Promise<UserProfileResponse | null> {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    const { roles: userRoleList, permissions: userPermList } =
      await this.getUserRolesAndPermissions(userId);

    const customerRecords = await this.db
      .select()
      .from(customers)
      .where(eq(customers.userId, userId))
      .limit(1);

    const employeeRecords = await this.db
      .select()
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);

    const customer = customerRecords[0]
      ? {
          id: customerRecords[0].id,
          name: customerRecords[0].name,
          phone: customerRecords[0].phone,
          email: customerRecords[0].email,
          status: customerRecords[0].status,
        }
      : null;

    const employee = employeeRecords[0]
      ? {
          id: employeeRecords[0].id,
          name: employeeRecords[0].name,
          employmentStatus: employeeRecords[0].employmentStatus,
        }
      : null;

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
      roles: userRoleList,
      permissions: userPermList,
      customer,
      employee,
    };
  }
}
