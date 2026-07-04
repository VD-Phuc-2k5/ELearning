import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAnswerOptionDto } from './create-answer-option.dto';

export class CreateQuestionDto {
  @ApiProperty({ example: 'NestJS sử dụng design pattern nào?' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({
    example: 'NestJS sử dụng Dependency Injection để quản lý các providers.',
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({ type: [CreateAnswerOptionDto] })
  @IsArray()
  @ArrayMinSize(2, { message: 'Phải có ít nhất 2 đáp án' })
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerOptionDto)
  answerOptions!: CreateAnswerOptionDto[];

  @ApiProperty({ example: ['A'], description: 'Labels của các đáp án đúng' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 đáp án đúng' })
  @IsString({ each: true })
  correctOptionLabels!: string[];
}
