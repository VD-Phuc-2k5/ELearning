import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateQuestionBankRequestDto {
  @ApiProperty({ example: 'NestJS Fundamentals' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Tên ngân hàng câu hỏi phải có ít nhất 3 ký tự' })
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
