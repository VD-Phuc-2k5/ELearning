import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class VotePollDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 lựa chọn' })
  @IsUUID('4', { each: true })
  optionIds!: string[];
}
