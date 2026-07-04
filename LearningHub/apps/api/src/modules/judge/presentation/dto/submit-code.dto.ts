import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SubmitCodeDto {
  @ApiProperty({
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
  language!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  sourceCode!: string;
}
