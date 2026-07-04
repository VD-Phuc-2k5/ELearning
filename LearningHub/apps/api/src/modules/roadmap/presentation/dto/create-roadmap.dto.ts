import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRoadmapDto {
  @ApiProperty()
  @IsString()
  @MinLength(3, { message: 'Tên roadmap phải có ít nhất 3 ký tự' })
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
