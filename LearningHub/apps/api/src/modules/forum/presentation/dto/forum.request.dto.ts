import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

const VISIBILITY_VALUES = ['public', 'private', 'hidden'] as const;

export class CreateForumDto {
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: VISIBILITY_VALUES })
  @IsOptional()
  @IsIn(VISIBILITY_VALUES)
  visibility?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bannerUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() iconUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() categoryId?: number;
}

export class UpdateForumDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: VISIBILITY_VALUES })
  @IsOptional()
  @IsIn(VISIBILITY_VALUES)
  visibility?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bannerUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() iconUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() categoryId?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isLocked?: boolean;
}

export class SetForumRulesDto {
  @ApiProperty({ type: 'array' })
  rules!: Array<{ title: string; body: string }>;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['owner', 'moderator', 'member'] })
  @IsIn(['owner', 'moderator', 'member'])
  role!: string;
}

export class CreateInviteDto {
  @ApiPropertyOptional() @IsOptional() @IsString() inviteeId?: string;
}

export class CreateJoinRequestDto {
  @ApiPropertyOptional() @IsOptional() @IsString() message?: string;
}
