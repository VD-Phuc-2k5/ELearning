import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateForumTagDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Tên tag không được để trống' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Mã màu phải có định dạng #RRGGBB' })
  color?: string;
}
