import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import { CreateUserInput } from '../../dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  findUserWithRelations(id: number): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.places', 'places')
      .leftJoinAndSelect('user.comments', 'comments')
      .leftJoinAndSelect('comments.place', 'place')
      .where('user.id = :id', { id })
      .orderBy('places.createdAt', 'DESC')
      .addOrderBy('comments.createdAt', 'DESC')
      .getOne();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  create(data: CreateUserInput): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
