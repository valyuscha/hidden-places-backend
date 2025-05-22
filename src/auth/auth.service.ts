import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../models/user/user.service';
import { AuthenticatedUserInput, CreateUserInput, RegisterInput } from '../dto';
import { User } from '../entities';
import { JwtPayloadInput } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUserInput> {
    const user: User | null = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { id, email: userEmail, name } = user;
    return { id, email: userEmail, name };
  }

  async login(user: JwtPayloadInput) {
    const payload = { email: user.email, name: user.name, sub: user.id };
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
    };
  }

  async register(data: RegisterInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const createUserData: CreateUserInput = {
      ...data,
      password: hashedPassword,
    };
    return this.userService.create(createUserData);
  }
}
