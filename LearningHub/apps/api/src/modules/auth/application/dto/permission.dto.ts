import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const VALID_ACTIONS = ['create', 'get', 'update', 'delete'] as const;
export type PermissionAction = (typeof VALID_ACTIONS)[number];

export class CreatePermissionDto {
  @ApiProperty({ example: 'roles' })
  @IsString()
  @IsNotEmpty()
  resource!: string;

  @ApiProperty({ example: 'create', enum: VALID_ACTIONS })
  @IsIn(VALID_ACTIONS, {
    message: `action phải là một trong: ${VALID_ACTIONS.join(', ')}`,
  })
  action!: PermissionAction;

  @ApiProperty({ example: 'Tạo role mới' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
