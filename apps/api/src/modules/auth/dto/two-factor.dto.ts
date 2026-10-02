import { IsNotEmpty, IsString, Length } from "class-validator";

export class TwoFactorCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 64, {
    message: "Code must be a 6-digit TOTP code or valid recovery code",
  })
  code!: string;
}

export class TwoFactorAuthenticateDto {
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}
