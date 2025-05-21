import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class UpdatePlaceInput {
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) country?: string;
  @Field({ nullable: true }) city?: string;
  @Field(() => [String], { nullable: true }) tags?: string[];
  @Field(() => Float, { nullable: true }) latitude?: number;
  @Field(() => Float, { nullable: true }) longitude?: number;
  @Field({ nullable: true }) imageUrl?: string;
}
