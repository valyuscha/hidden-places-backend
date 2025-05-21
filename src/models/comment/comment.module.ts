import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment, CommentVote, Place, User } from '../../entities';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Place, User, CommentVote])],
  providers: [CommentService, CommentResolver],
  exports: [CommentService],
})
export class CommentModule {}
