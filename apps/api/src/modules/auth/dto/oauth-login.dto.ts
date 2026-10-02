import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class OAuthLoginDto {
  @IsString()
  @IsNotEmpty()
  provider!: string; // e.g. 'google'

  @IsString()
  @IsNotEmpty()
  providerUserId!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
