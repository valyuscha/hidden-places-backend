import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Comment } from '../entities';

@ObjectType()
export class CommentsResponse {
  @Field(() => [Comment])
  comments: Comment[];

  @Field(() => Int)
  totalCount: number;
}
