import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

export class UpdateTagRequestDto {
  @ApiPropertyOptional({ example: 'NestJS Pro' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Các câu hỏi nâng cao' })
  @IsString()
  @IsOptional()
  description?: string;
}
