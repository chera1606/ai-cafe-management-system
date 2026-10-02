import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {
  type Profile,
  Strategy,
  type VerifyCallback,
} from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>(
        "GOOGLE_CLIENT_ID",
        "placeholder-google-client-id",
      ),
      clientSecret: configService.get<string>(
        "GOOGLE_CLIENT_SECRET",
        "placeholder-google-client-secret",
      ),
      callbackURL: configService.get<string>(
        "GOOGLE_CALLBACK_URL",
        "http://localhost:3000/api/v1/auth/google/callback",
      ),
      scope: ["email", "profile"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;
    const user = {
      provider: "google",
      providerUserId: id,
      email: emails?.[0]?.value || "",
      name:
        `${name?.givenName || ""} ${name?.familyName || ""}`.trim() ||
        "Google User",
      avatarUrl: photos?.[0]?.value,
    };
    done(null, user);
  }
}
