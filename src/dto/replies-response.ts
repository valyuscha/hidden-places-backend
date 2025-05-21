import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Comment } from '../entities';

@ObjectType()
export class RepliesResponse {
  @Field(() => [Comment])
  replies: Comment[];

  @Field(() => Int)
  totalCount: number;
}
