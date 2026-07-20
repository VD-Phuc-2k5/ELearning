import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['owner', 'moderator', 'member'] })
  @IsIn(['owner', 'moderator', 'member'])
  @IsNotEmpty()
  role!: string;
}
