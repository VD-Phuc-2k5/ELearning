import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;
}
