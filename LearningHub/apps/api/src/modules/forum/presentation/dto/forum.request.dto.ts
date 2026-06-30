import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class ForumRuleDto {
  @ApiProperty() @IsString() title!: string;
  @ApiProperty() @IsString() body!: string;
}

export class SetForumRulesDto {
  @ApiProperty({ type: [ForumRuleDto] })
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => ForumRuleDto)
  rules!: ForumRuleDto[];
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
