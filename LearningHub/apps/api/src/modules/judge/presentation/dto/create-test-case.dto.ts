import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTestCaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Input không được để trống' })
  @MaxLength(65536, { message: 'Input không được vượt quá 64KB' })
  input!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Expected output không được để trống' })
  @MaxLength(65536, { message: 'Expected output không được vượt quá 64KB' })
  expectedOutput!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;
}
