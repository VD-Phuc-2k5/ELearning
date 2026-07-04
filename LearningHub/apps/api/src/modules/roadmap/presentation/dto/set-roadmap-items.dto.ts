import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class SetRoadmapItemsDto {
  @ApiProperty({
    type: [String],
    description: 'Ordered list of question bank UUIDs',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 item' })
  @IsUUID('4', { each: true })
  bankIds!: string[];
}
