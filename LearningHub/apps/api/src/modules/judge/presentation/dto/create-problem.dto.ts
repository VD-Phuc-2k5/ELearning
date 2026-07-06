import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export const SUPPORTED_LANGUAGES = [
  'python',
  'javascript',
  'c',
  'cpp',
  'java',
  'go',
  'csharp',
  'rust',
  'typescript',
  'swift',
] as const;

export class CreateProblemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' })
  @Transform(({ value }) => value?.trim())
  title!: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @MaxLength(10000, { message: 'Mô tả không được vượt quá 10000 ký tự' })
  description!: string;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'] })
  @IsIn(['easy', 'medium', 'hard'], {
    message: 'Độ khó phải là easy, medium hoặc hard',
  })
  difficulty!: 'easy' | 'medium' | 'hard';

  @ApiPropertyOptional({ default: 5000 })
  @IsOptional()
  @IsInt()
  @Min(100, { message: 'Giới hạn thời gian tối thiểu là 100ms' })
  timeLimitMs?: number;

  @ApiPropertyOptional({ default: 256 })
  @IsOptional()
  @IsInt()
  @Min(16, { message: 'Giới hạn bộ nhớ tối thiểu là 16MB' })
  memoryLimitMb?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Sample input không được vượt quá 5000 ký tự' })
  sampleInput?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Sample output không được vượt quá 5000 ký tự' })
  sampleOutput?: string;

  @ApiProperty({ type: [String], enum: SUPPORTED_LANGUAGES })
  @IsArray({ message: 'Danh sách ngôn ngữ phải là mảng' })
  @IsString({ each: true })
  @IsIn(SUPPORTED_LANGUAGES, {
    each: true,
    message: `Mỗi ngôn ngữ phải thuộc danh sách: ${SUPPORTED_LANGUAGES.join(', ')}`,
  })
  languages!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject({ message: 'Templates phải là object key-value' })
  @ValidateIf((o) => o.templates !== undefined)
  templates?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject({ message: 'Wrappers phải là object key-value' })
  @ValidateIf((o) => o.wrappers !== undefined)
  wrappers?: Record<string, string>;
}

export class UpdateProblemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' })
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @MaxLength(10000, { message: 'Mô tả không được vượt quá 10000 ký tự' })
  description?: string;

  @ApiPropertyOptional({ enum: ['easy', 'medium', 'hard'] })
  @IsOptional()
  @IsIn(['easy', 'medium', 'hard'], {
    message: 'Độ khó phải là easy, medium hoặc hard',
  })
  difficulty?: 'easy' | 'medium' | 'hard';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(100)
  timeLimitMs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(16)
  memoryLimitMb?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  sampleInput?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  sampleOutput?: string;

  @ApiPropertyOptional({ type: [String], enum: SUPPORTED_LANGUAGES })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(SUPPORTED_LANGUAGES, { each: true })
  languages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  templates?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  wrappers?: Record<string, string>;
}
