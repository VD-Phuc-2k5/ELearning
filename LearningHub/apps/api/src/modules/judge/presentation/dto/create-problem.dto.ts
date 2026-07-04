import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProblemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'] })
  @IsIn(['easy', 'medium', 'hard'])
  difficulty!: 'easy' | 'medium' | 'hard';

  @ApiPropertyOptional({ default: 5000 })
  @IsOptional()
  @IsInt()
  @Min(100)
  timeLimitMs?: number;

  @ApiPropertyOptional({ default: 256 })
  @IsOptional()
  @IsInt()
  @Min(16)
  memoryLimitMb?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sampleInput?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sampleOutput?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  languages!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  templates?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  wrappers?: Record<string, string>;
}
