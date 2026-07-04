import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { SubmitAnswerInputDto } from './submit-answer-input.dto';

export class SubmitQuizInputDto {
  @ApiProperty({ type: [SubmitAnswerInputDto] })
  @IsArray()
  @IsNotEmpty({ message: 'Danh sách câu trả lời không được để trống' })
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 câu trả lời' })
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerInputDto)
  answers!: SubmitAnswerInputDto[];

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
