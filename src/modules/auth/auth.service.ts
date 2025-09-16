import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto'; // Thêm RegisterDto
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const findUser = await this.userModel.findOne({ email });
    if (!findUser) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = {
      userId: findUser._id,
      email: findUser.email,
      role: findUser.role,
    };

    const token = this.jwtService.sign(payload);
    return { token };
  }

  async register(user: RegisterDto): Promise<User> {
    const existEmail = await this.userModel.findOne({ email: user.email });
    if (existEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    user.password = hashedPassword;

    const newUser = new this.userModel(user);
    return newUser.save();
  }
}
