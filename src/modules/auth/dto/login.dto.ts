import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'son.goku@gmail.com', description: 'Email' })
  email: string;

  @ApiProperty({ example: '123456Ab@', description: 'Password' })
  password: string;
}
