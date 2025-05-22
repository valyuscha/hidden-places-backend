import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginInput, RegisterInput } from '../dto';
import { User } from '../entities';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  currentUser(@CurrentUser() user) {
    return user;
  }

  @Mutation(() => Boolean)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @Context() context,
  ): Promise<boolean> {
    const user = await this.authService.validateUser(
      loginInput.email,
      loginInput.password,
    );

    try {
      const loginData = await this.authService.login(user)
      const token = loginData?.access_token;
      const res: Response = context.res;

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  @Mutation(() => Boolean)
  async register(
    @Args('registerInput') registerInput: RegisterInput,
    @Context() context,
  ): Promise<boolean> {
    const user = await this.authService.register(registerInput);

    try {
      const loginData = await this.authService.login(user);
      const token = loginData?.access_token;
      const res: Response = context.res;

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  @Mutation(() => Boolean)
  logout(@Context() context): boolean {
    const res: Response = context.res;

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });

    return true;
  }
}
