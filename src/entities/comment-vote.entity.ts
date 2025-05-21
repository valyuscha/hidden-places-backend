import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User, Comment } from './';

@ObjectType()
@Entity()
@Unique(['user', 'comment'])
export class CommentVote {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Boolean)
  @Column()
  isLike: boolean;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.votes, { onDelete: 'CASCADE' })
  comment: Comment;
}
