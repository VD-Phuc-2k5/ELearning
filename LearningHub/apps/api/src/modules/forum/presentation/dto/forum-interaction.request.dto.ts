import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ToggleReactionDto {
  @ApiProperty() @IsString() emoji!: string;
}
