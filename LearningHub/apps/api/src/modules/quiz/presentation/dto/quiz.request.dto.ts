import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuestionBankRequestDto {
  @ApiProperty({ example: 'NestJS Fundamentals' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Kiến thức cơ bản về NestJS framework' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds?: number[];
}

export class CreateAnswerOptionDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  optionLabel!: string;

  @ApiProperty({ example: 'Dependency Injection' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'NestJS sử dụng design pattern nào?' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: 'NestJS sử dụng Dependency Injection để quản lý các providers.' })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({ type: [CreateAnswerOptionDto] })
  @IsArray()
  answerOptions!: CreateAnswerOptionDto[];

  @ApiProperty({ example: ['A'], description: 'Labels của các đáp án đúng' })
  @IsArray()
  @IsString({ each: true })
  correctOptionLabels!: string[];
}

export class UploadQuestionsRequestDto {
  @ApiProperty({ type: [CreateQuestionDto] })
  @IsArray()
  questions!: CreateQuestionDto[];
}

export class SubmitAnswerItemDto {
  @ApiProperty({ example: 'uuid-question-id' })
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @ApiProperty({ example: 'uuid-option-id' })
  @IsString()
  @IsNotEmpty()
  selectedOptionId!: string;
}

export class SubmitQuizRequestDto {
  @ApiProperty({ type: [SubmitAnswerItemDto] })
  @IsArray()
  answers!: SubmitAnswerItemDto[];
}

export class VerifyQuestionAnswerRequestDto {
  @ApiProperty({ example: 'uuid-option-id' })
  @IsString()
  @IsNotEmpty()
  selectedOptionId!: string;
}

export class CreateTagRequestDto {
  @ApiProperty({ example: 'NestJS' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Các câu hỏi về NestJS framework' })
  @IsString()
  @IsOptional()
  description?: string;
}
