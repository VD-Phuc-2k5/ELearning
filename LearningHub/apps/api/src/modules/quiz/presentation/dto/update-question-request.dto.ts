import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAnswerOptionDto } from './create-answer-option.dto';

export class UpdateQuestionRequestDto {
  @ApiPropertyOptional({ example: 'NestJS sử dụng design pattern nào mới?' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 'Giải thích chi tiết về DI' })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({ type: [CreateAnswerOptionDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerOptionDto)
  answerOptions?: CreateAnswerOptionDto[];

  @ApiPropertyOptional({
    example: ['B'],
    description: 'Labels của các đáp án đúng',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  correctOptionLabels?: string[];
}
