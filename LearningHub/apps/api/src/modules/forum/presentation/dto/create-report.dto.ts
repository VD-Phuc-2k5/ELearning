import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { MODERATION_REASONS } from '../../domain/constants/moderation-reasons';

export class CreateReportDto {
  @ApiProperty({ enum: ['forum', 'post', 'comment'] })
  @IsIn(['forum', 'post', 'comment'])
  targetType!: string;

  @ApiProperty()
  @IsUUID('4', { message: 'targetId phải là UUID hợp lệ' })
  targetId!: string;

  @ApiProperty({ enum: MODERATION_REASONS })
  @IsIn([...MODERATION_REASONS])
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
