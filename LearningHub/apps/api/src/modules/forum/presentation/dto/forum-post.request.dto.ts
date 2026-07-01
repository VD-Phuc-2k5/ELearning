import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

const POST_TYPES = [
  'text',
  'poll',
  'share_roadmap',
  'share_question_bank',
] as const;

export class PollOptionDto {
  @ApiProperty() @IsString() text!: string;
}

export class PollDto {
  @ApiProperty() @IsString() question!: string;
  @ApiProperty({ type: [PollOptionDto] }) @IsArray() options!: PollOptionDto[];
  @ApiPropertyOptional() @IsOptional() @IsDateString() endsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isMultipleChoice?: boolean;
}

export class CreatePostDto {
  @ApiProperty() @IsString() title!: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() content?: Record<
    string,
    unknown
  >;
  @ApiPropertyOptional({ enum: POST_TYPES })
  @IsOptional()
  @IsString()
  postType?: string;
  @ApiPropertyOptional() @IsOptional() poll?: PollDto;
  @ApiPropertyOptional() @IsOptional() @IsUUID() roadmapId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() questionBankId?: string;
}

export class UpdatePostDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() content?: Record<
    string,
    unknown
  >;
}

export class CreateCommentDto {
  @ApiProperty() @IsString() content!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() parentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty() @IsString() content!: string;
}

export class VotePollDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  optionIds!: string[];
}
