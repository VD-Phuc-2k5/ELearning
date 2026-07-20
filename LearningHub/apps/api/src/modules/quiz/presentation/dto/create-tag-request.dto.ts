import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTagRequestDto {
  @ApiProperty({ example: 'NestJS' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Tên tag không được để trống' })
  name!: string;

  @ApiPropertyOptional({ example: 'Các câu hỏi về NestJS framework' })
  @IsString()
  @IsOptional()
  description?: string;
}
