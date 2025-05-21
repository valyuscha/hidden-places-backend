import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { User, Place, Comment, CommentVote } from './entities';
import { UserModule } from './models/user/user.module';
import { PlaceModule } from './models/place/place.module';
import { CommentModule } from './models/comment/comment.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Place, Comment, CommentVote],
      synchronize: false,
      autoLoadEntities: true,
      ssl: { rejectUnauthorized: false },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req, res }) => ({ req, res }),
      autoSchemaFile: 'schema.gql',
      playground: true,
      introspection: true,
    }),
    UserModule,
    PlaceModule,
    CommentModule,
    AuthModule,
    UploadModule,
  ],
})
export class AppModule {}
