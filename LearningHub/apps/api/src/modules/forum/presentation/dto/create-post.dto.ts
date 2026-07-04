import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PollDto } from './poll.dto';

const POST_TYPES = [
  'text',
  'poll',
  'share_roadmap',
  'share_question_bank',
] as const;

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: POST_TYPES })
  @IsOptional()
  @IsString()
  postType?: string;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PollDto)
  poll?: PollDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'roadmapId phải là UUID hợp lệ' })
  roadmapId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'questionBankId phải là UUID hợp lệ' })
  questionBankId?: string;
}
