import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { CreditAccountStatus } from "./credit-constants";

export class CreditQueryDto {
  @ApiPropertyOptional({
    description: "Filter accounts by operational status",
    enum: CreditAccountStatus,
  })
  @IsOptional()
  @IsEnum(CreditAccountStatus)
  status?: CreditAccountStatus;

  @ApiPropertyOptional({
    description: "Search filter across customer name, phone, or corporate title",
    example: "Ethiopian Airlines",
  })
  @IsOptional()
  @IsString()
  search?: string;
}
