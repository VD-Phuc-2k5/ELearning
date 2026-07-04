import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateInviteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'inviteeId phải là UUID hợp lệ' })
  inviteeId?: string;
}
