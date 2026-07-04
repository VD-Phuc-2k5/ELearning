import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class UploadQuestionsRequestDto {
  @ApiProperty({ type: [CreateQuestionDto] })
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 câu hỏi' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions!: CreateQuestionDto[];
}
