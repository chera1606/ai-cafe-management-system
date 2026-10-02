import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RequestMagicLinkDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class VerifyMagicLinkDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  newPassword!: string;
}
