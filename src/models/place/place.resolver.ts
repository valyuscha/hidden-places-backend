import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PlaceService } from './place.service';
import { Place } from '../../entities';
import { CreatePlaceInput, UpdatePlaceInput } from '../../dto';

@Resolver(() => Place)
export class PlaceResolver {
  constructor(
    private readonly placeService: PlaceService,
  ) {}

  @Query(() => [Place])
  places(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 9 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args({ name: 'tags', type: () => [String], nullable: true }) tags?: string[],
  ): Promise<Place[]> {
    return this.placeService.findAll(limit, offset, search, tags);
  }

  @Query(() => Place)
  place(@Args('id', { type: () => Int }) id: number): Promise<Place> {
    return this.placeService.findOne(id);
  }

  @Mutation(() => Place)
  async createPlace(
    @Args('createPlaceInput') createPlaceInput: CreatePlaceInput,
  ): Promise<Place> {
    try {
      return await this.placeService.create(createPlaceInput);
    } catch (error) {
      // Add the logMessage to the GraphQL error extensions
      if (error.logMessage) {
        error.extensions = {
          ...error.extensions,
          logMessage: error.logMessage
        };
      }
      throw error;
    }
  }

  @Mutation(() => Place)
  updatePlace(
    @Args('id', { type: () => Int }) id: number,
    @Args('updatePlaceInput') updatePlaceInput: UpdatePlaceInput,
  ): Promise<Place> {
    return this.placeService.update(id, updatePlaceInput);
  }

  @Mutation(() => Boolean)
  async removePlace(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.placeService.remove(id);
    return true;
  }
}
