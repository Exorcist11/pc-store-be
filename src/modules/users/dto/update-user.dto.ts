import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Optional new username' })
  username?: string;

  @ApiPropertyOptional({ description: 'Optional new email' })
  email?: string;

  @ApiPropertyOptional({ description: 'Optional new password (min 6 chars)' })
  password?: string;

  @ApiPropertyOptional({ description: 'Optional new full name' })
  fullName?: string;

  @ApiPropertyOptional({ description: 'Optional new phone number' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Optional new role',
    enum: ['customer', 'admin', 'staff'],
  })
  role?: string;
}
