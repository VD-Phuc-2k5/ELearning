import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { SubmitAnswerItemDto } from './submit-answer-item.dto';

export class SubmitQuizRequestDto {
  @ApiProperty({ type: [SubmitAnswerItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 câu trả lời' })
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerItemDto)
  answers!: SubmitAnswerItemDto[];

  @ApiPropertyOptional({ example: 'uuid-roadmap-id' })
  @IsOptional()
  @IsUUID('4', { message: 'roadmapId phải là UUID hợp lệ' })
  roadmapId?: string | null;

  @ApiPropertyOptional({
    example: 120,
    description: 'Thời gian làm bài (giây)',
  })
  @IsOptional()
  @IsInt({ message: 'durationSeconds phải là số nguyên' })
  @Min(0, { message: 'durationSeconds không được âm' })
  durationSeconds?: number;
}
