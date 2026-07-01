import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty({
    example: 'Password123@',
    description: 'Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, {
    message:
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 ký tự đặc biệt',
  })
  password!: string;

  @ApiProperty({ example: 'username' })
  @IsString({ message: 'Tên người dùng phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tên người dùng phải có ít nhất 3 ký tự' })
  username!: string;
}
