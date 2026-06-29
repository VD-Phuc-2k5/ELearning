import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { MODERATION_REASONS } from '../../domain/constants/moderation-reasons';

export class CreateReportDto {
  @ApiProperty({ enum: ['forum', 'post', 'comment'] })
  @IsIn(['forum', 'post', 'comment'])
  targetType!: string;
  @ApiProperty() @IsUUID() targetId!: string;
  @ApiProperty({ enum: MODERATION_REASONS })
  @IsIn([...MODERATION_REASONS])
  reason!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class HideContentDto {
  @ApiProperty({ enum: MODERATION_REASONS })
  @IsIn([...MODERATION_REASONS])
  reasonCode!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reasonText?: string;
}

export class ResolveReportDto {
  @ApiProperty() @IsString() resolutionNote!: string;
}

export class DismissReportDto {
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}
