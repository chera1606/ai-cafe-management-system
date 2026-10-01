import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { JwtPayload } from "../interfaces/jwt-payload.interface";

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
