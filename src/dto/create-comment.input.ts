import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field() text: string;
  @Field(() => Int) userId: number;
  @Field(() => Int) placeId: number;
  @Field(() => Int, { nullable: true }) parentCommentId?: number;
}
