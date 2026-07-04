import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SubmitAnswerInputDto {
  @ApiProperty({ example: 'uuid-question-id' })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4', { message: 'questionId phải là UUID hợp lệ' })
  questionId!: string;

  @ApiProperty({ example: 'uuid-option-id' })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4', { message: 'selectedOptionId phải là UUID hợp lệ' })
  selectedOptionId!: string;
}
