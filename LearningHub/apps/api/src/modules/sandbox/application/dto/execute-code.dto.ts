import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ExecuteCodeDto {
  @ApiProperty({
    example: 'python',
    enum: [
      'python',
      'javascript',
      'c',
      'java',
      'go',
      'csharp',
      'cpp',
      'rust',
      'typescript',
      'swift',
    ],
  })
  @IsIn([
    'python',
    'javascript',
    'c',
    'java',
    'go',
    'csharp',
    'cpp',
    'rust',
    'typescript',
    'swift',
  ])
  @IsNotEmpty()
  language!: string;

  @ApiProperty({ example: "print('Hello world')" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  sourceCode!: string;

  @ApiProperty({ example: 'some input data', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  stdin?: string;
}
