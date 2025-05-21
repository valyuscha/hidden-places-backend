import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../entities';
import { CreateUserInput } from '../../dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  users(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  async getUser(@Args('id', { type: () => Int }) id: number): Promise<User> {
    const user = await this.userService.findUserWithRelations(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  @Mutation(() => User)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    const deleted = await this.userService.delete(id);

    if (!deleted) {
      throw new NotFoundException(
        `User with ID ${id} not found or already deleted`,
      );
    }
    return true;
  }
}
