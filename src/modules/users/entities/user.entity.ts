import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: '64f92e8e8c9e2f0c12345678' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'hashedpassword' })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: '0123456789' })
  phone?: string;

  @ApiProperty({ enum: ['customer', 'admin', 'staff'], default: 'customer' })
  role: string;
}
