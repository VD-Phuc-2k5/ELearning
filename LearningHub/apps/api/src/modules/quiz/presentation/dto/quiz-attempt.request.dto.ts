import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({ example: 'uuid-roadmap-id' })
  @IsOptional()
  @IsString()
  roadmapId?: string | null;
}
