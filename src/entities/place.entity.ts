import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from './user.entity';
import { Comment } from './comment.entity';

@ObjectType()
@Entity()
export class Place {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column()
  country: string;

  @Field()
  @Column()
  city: string;

  @Field(() => [String])
  @Column('text', { array: true, default: [] })
  tags: string[];

  @Field(() => Float)
  @Column('double precision')
  latitude: number;

  @Field(() => Float)
  @Column('double precision')
  longitude: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  imagePublicId?: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.places, { eager: true, onDelete: 'CASCADE' })
  createdBy: User;

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, (comment) => comment.place, { cascade: true })
  comments: Comment[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
