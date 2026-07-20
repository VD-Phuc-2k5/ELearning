import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAnswerOptionDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5, { message: 'Nhãn đáp án không được vượt quá 5 ký tự' })
  optionLabel!: string;

  @ApiProperty({ example: 'Dependency Injection' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
