import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class VerifyPaymentDto {
  @ApiProperty({
    description: "Verification outcome status",
    enum: ["PAID", "FAILED"],
    example: "PAID",
  })
  @IsEnum(["PAID", "FAILED"], { message: "status must be either PAID or FAILED" })
  status!: "PAID" | "FAILED";

  @ApiPropertyOptional({
    description: "External provider confirmation code or transaction reference",
    example: "TXN-TB-9823147",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  providerReference?: string;

  @ApiPropertyOptional({
    description: "Reason if payment verification failed",
    example: "Insufficient balance or transaction timed out",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  failureReason?: string;
}
