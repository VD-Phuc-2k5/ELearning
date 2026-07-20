import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateQuestionBankRequestDto {
  @ApiPropertyOptional({ example: 'NestJS Advanced' })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Tên ngân hàng câu hỏi phải có ít nhất 3 ký tự' })
  title?: string;

  @ApiPropertyOptional({ example: 'Kiến thức nâng cao về NestJS' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'published' })
  @IsString()
  @IsOptional()
  statusId?: string;

  @ApiPropertyOptional({ example: [1, 3], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds?: number[];
}
