import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In, QueryFailedError } from 'typeorm';
import { Comment, Place, User, CommentVote } from '../../entities';
import { CreateCommentInput, RepliesResponse, CommentsResponse } from '../../dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(CommentVote)
    private readonly voteRepo: Repository<CommentVote>,
    @InjectRepository(Place)
    private readonly placeRepo: Repository<Place>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(data: CreateCommentInput): Promise<Comment> {
    const user = await this.userRepo.findOneByOrFail({ id: data.userId });
    const place = await this.placeRepo.findOneByOrFail({ id: data.placeId });

    let parentComment: Comment | null = null;
    if (data.parentCommentId) {
      parentComment = await this.commentRepo.findOne({
        where: { id: data.parentCommentId },
        relations: ['place'],
      });

      if (!parentComment) {
        throw new NotFoundException(`Parent comment not found`);
      }

      if (parentComment.place.id !== data.placeId) {
        throw new BadRequestException(
          `Parent comment must belong to the same place`,
        );
      }
    }

    const comment: Comment = this.commentRepo.create({
      text: data.text,
      user,
      place,
      ...(parentComment ? { parentComment } : {}),
    });

    return this.commentRepo.save(comment);
  }

  async findByPlace(
    placeId: number,
    userId?: number,
    skip = 0,
    take = 5,
    repliesTake = 5,
  ): Promise<CommentsResponse> {
    const [comments, totalCount] = await this.commentRepo.findAndCount({
      where: { place: { id: placeId }, parentComment: IsNull() },
      relations: ['user', 'place'],
      order: { id: 'DESC' },
      skip,
      take,
    });

    if (comments.length === 0) {
      return { comments: [], totalCount };
    }

    const commentIds = comments.map((c) => c.id);

    const replies = await this.commentRepo.find({
      where: { parentComment: { id: In(commentIds) } },
      relations: ['user', 'place', 'parentComment'],
      order: { id: 'DESC' },
    });

    const repliesMap = new Map<number, Comment[]>();
    for (const reply of replies) {
      const parentId = reply.parentComment?.id;
      if (!parentId) continue;
      if (!repliesMap.has(parentId)) {
        repliesMap.set(parentId, []);
      }
      repliesMap.get(parentId)!.push(reply);
    }

    const allCommentIds = [...commentIds, ...replies.map((r) => r.id)];

    const votes = userId
      ? await this.voteRepo.find({
        where: {
          user: { id: userId },
          comment: { id: In(allCommentIds) },
        },
        relations: ['comment'],
      })
      : [];

    const voteMap = new Map<number, CommentVote>();
    for (const vote of votes) {
      voteMap.set(vote.comment?.id, vote);
    }

    for (const comment of comments) {
      const allReplies = repliesMap.get(comment.id) ?? [];
      comment.replies = allReplies.slice(0, repliesTake) ?? [];
      comment['hasMoreReplies'] = allReplies.length > repliesTake;

      const vote = voteMap.get(comment.id);
      comment.hasUserLiked = vote?.isLike ?? false;
      comment.hasUserDisliked = vote ? !vote.isLike : false;

      for (const reply of comment.replies) {
        const replyVote = voteMap.get(reply.id);
        reply.hasUserLiked = replyVote?.isLike ?? false;
        reply.hasUserDisliked = replyVote ? !replyVote.isLike : false;
      }
    }

    return { comments, totalCount };
  }

  async findRepliesByComment(
    commentId: number,
    userId?: number,
    skip = 0,
    take = 5,
  ): Promise<RepliesResponse> {
    const [replies, totalCount] = await this.commentRepo.findAndCount({
      where: { parentComment: { id: commentId } },
      relations: ['user', 'place', 'parentComment'],
      order: { id: 'DESC' },
      skip,
      take,
    });

    if (!userId || replies.length === 0) {
      return { replies, totalCount };
    }

    const votes = await this.voteRepo.find({
      where: {
        user: { id: userId },
        comment: { id: In(replies.map(r => r.id)) },
      },
    });

    const voteMap = new Map<number, CommentVote>();
    for (const vote of votes) {
      voteMap.set(vote.comment.id, vote);
    }

    for (const reply of replies) {
      const vote = voteMap.get(reply.id);
      reply.hasUserLiked = vote?.isLike ?? false;
      reply.hasUserDisliked = vote ? !vote.isLike : false;
    }

    return { replies, totalCount };
  }

  async findOne(id: number, userId?: number): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['user', 'place'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (userId) {
      const vote = await this.voteRepo.findOne({
        where: { user: { id: userId }, comment: { id } },
      });

      comment.hasUserLiked = vote?.isLike ?? false;
      comment.hasUserDisliked = vote ? !vote.isLike : false;
    }

    return comment;
  }

  async update(id: number, text: string): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    comment.text = text;
    return this.commentRepo.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.findOne(id);
    await this.commentRepo.remove(comment);
  }

  async likeComment(id: number): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.likes += 1;
    return this.commentRepo.save(comment);
  }

  async dislikeComment(id: number): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.dislikes += 1;
    return this.commentRepo.save(comment);
  }

  async vote(
    userId: number,
    commentId: number,
    isLike: boolean,
  ): Promise<Comment> {
    const user = await this.userRepo.findOneByOrFail({ id: userId });
    const comment = await this.commentRepo.findOneOrFail({
      where: { id: commentId },
      relations: ['user', 'place'],
    });

    let vote = await this.voteRepo.findOne({
      where: { user: { id: userId }, comment: { id: commentId } },
    });

    if (vote) {
      if (vote.isLike === isLike) {
        throw new BadRequestException('Already voted this way');
      }

      vote.isLike = isLike;
      await this.voteRepo.save(vote);
    } else {
      try {
        vote = this.voteRepo.create({user, comment, isLike});
        await this.voteRepo.save(vote);
      } catch (err) {
        if (err instanceof QueryFailedError && err.message.includes('duplicate key')) {
          const existing = await this.voteRepo.findOneByOrFail({
            user: {id: userId},
            comment: {id: commentId},
          });

          if (existing.isLike === isLike) {
            throw new BadRequestException('Already voted this way');
          }

          existing.isLike = isLike;
          await this.voteRepo.save(existing);
        } else {
          throw err;
        }
      }
    }

    const [likes, dislikes] = await Promise.all([
      this.voteRepo.count({ where: { comment: { id: commentId }, isLike: true } }),
      this.voteRepo.count({ where: { comment: { id: commentId }, isLike: false } }),
    ]);

    comment.likes = likes;
    comment.dislikes = dislikes;

    comment.hasUserLiked = vote?.isLike === true;
    comment.hasUserDisliked = !vote?.isLike === false;

    return this.commentRepo.save(comment);
  }
}
