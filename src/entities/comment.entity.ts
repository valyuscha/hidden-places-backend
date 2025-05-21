import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User, Place, CommentVote } from './';

@ObjectType()
@Entity()
export class Comment {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  text: string;

  @Field(() => Int)
  @Column({ default: 0 })
  likes: number;

  @Field(() => Int)
  @Column({ default: 0 })
  dislikes: number;

  @Field(() => [CommentVote], { nullable: true })
  @OneToMany(() => CommentVote, (vote) => vote.comment)
  votes?: CommentVote[];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Field(() => Place)
  @ManyToOne(() => Place, (place) => place.comments, { onDelete: 'CASCADE' })
  place: Place;

  @Field(() => Comment, { nullable: true })
  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  parentComment?: Comment;

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, (comment) => comment.parentComment, {
    cascade: true,
  })
  replies?: Comment[];

  @Field(() => Boolean, { nullable: true })
  hasMoreReplies?: boolean;

  @Field(() => Boolean, { nullable: true })
  hasUserLiked?: boolean;

  @Field(() => Boolean, { nullable: true })
  hasUserDisliked?: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
