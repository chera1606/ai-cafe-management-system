import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class AdjustCreditBalanceDto {
  @ApiProperty({
    description: "Signed adjustment amount in ETB (+ to increase balance, - to write down balance)",
    example: -250.0,
  })
  @IsNumber()
  amount!: number;

  @ApiProperty({
    description: "Mandatory justification for financial audit trail (min 5 chars)",
    example: "Reconciliation correction for duplicate billing voucher #402",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, {
    message: "Mandatory audit reason must be at least 5 characters long",
  })
  reason!: string;
}
