import { InputType, Field, Float, Int } from '@nestjs/graphql';

@InputType()
export class CreatePlaceInput {
  @Field() title: string;
  @Field({ nullable: true }) description?: string;
  @Field() country: string;
  @Field() city: string;
  @Field(() => [String]) tags: string[];
  @Field(() => Float) latitude: number;
  @Field(() => Float) longitude: number;
  @Field({ nullable: true }) imageUrl?: string;
  @Field({ nullable: true }) imagePublicId?: string;
  @Field(() => Int) createdById: number;
}
