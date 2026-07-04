import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTagRequestDto {
  @ApiPropertyOptional({ example: 'NestJS Pro' })
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Tên tag không được để trống' })
  name?: string;

  @ApiPropertyOptional({ example: 'Các câu hỏi nâng cao' })
  @IsString()
  @IsOptional()
  description?: string;
}
