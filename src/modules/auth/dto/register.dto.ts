import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Son Goku', description: 'FullName' })
  fullName: string;

  @ApiProperty({ example: 'son.goku@gmail.com', description: 'Email' })
  email: string;

  @ApiProperty({ example: '0919934251', description: 'PhoneNumber' })
  phoneNumber: string;

  @ApiProperty({ example: '123456Ab@', description: 'Password' })
  password: string;

  @ApiProperty({ example: 'user', description: 'Role' })
  role: string;
}
