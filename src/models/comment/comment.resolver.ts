import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment } from '../../entities';
import { CommentsResponse, CreateCommentInput, RepliesResponse } from '../../dto';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Query(() => Comment)
  comment(
    @Args('id', { type: () => Int }) id: number,
    @Args('userId', { type: () => Int, nullable: true }) userId?: number,
  ): Promise<Comment> {
    return this.commentService.findOne(id, userId);
  }

  @Query(() => CommentsResponse)
  async commentsByPlace(
    @Args('placeId', { type: () => Int }) placeId: number,
    @Args('userId', { type: () => Int, nullable: true }) userId?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip = 0,
  ): Promise<CommentsResponse> {
    return this.commentService.findByPlace(placeId, userId, skip);
  }

  @Query(() => RepliesResponse)
  repliesByComment(
    @Args('commentId', { type: () => Int }) commentId: number,
    @Args('userId', { type: () => Int, nullable: true }) userId?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip = 0,
    @Args('take', { type: () => Int, nullable: true }) take = 5,
  ): Promise<RepliesResponse> {
    return this.commentService.findRepliesByComment(commentId, userId, skip, take);
  }

  @Mutation(() => Comment)
  createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ): Promise<Comment> {
    return this.commentService.create(createCommentInput);
  }

  @Mutation(() => Comment)
  updateComment(
    @Args('id', { type: () => Int }) id: number,
    @Args('text') text: string,
  ): Promise<Comment> {
    return this.commentService.update(id, text);
  }

  @Mutation(() => Boolean)
  async removeComment(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.commentService.remove(id);
    return true;
  }

  @Mutation(() => Comment)
  likeComment(@Args('id', { type: () => Int }) id: number): Promise<Comment> {
    return this.commentService.likeComment(id);
  }

  @Mutation(() => Comment)
  dislikeComment(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Comment> {
    return this.commentService.dislikeComment(id);
  }

  @Mutation(() => Comment)
  voteComment(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('commentId', { type: () => Int }) commentId: number,
    @Args('isLike', { type: () => Boolean }) isLike: boolean,
  ): Promise<Comment> {
    return this.commentService.vote(userId, commentId, isLike);
  }
}
