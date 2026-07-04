import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { MODERATION_REASONS } from '../../domain/constants/moderation-reasons';

export class HideContentDto {
  @ApiProperty({ enum: MODERATION_REASONS })
  @IsIn([...MODERATION_REASONS])
  reasonCode!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reasonText?: string;
}
