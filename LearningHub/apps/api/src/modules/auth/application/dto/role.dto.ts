import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'INSTRUCTOR', description: 'Unique role code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Giảng viên' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Giảng viên của khóa học' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Giảng viên cao cấp' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
