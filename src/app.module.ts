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

// SSL configuration for Supabase connection pooler
// Note: rejectUnauthorized is set to false because Supabase's pooler
// uses a certificate chain that Node.js cannot fully verify.
// The connection is still encrypted with SSL/TLS.
const sslOptions = {
  rejectUnauthorized: false,
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Place, Comment, CommentVote],
      synchronize: false,
      autoLoadEntities: true,
      ssl: sslOptions,
      extra: {
        keepAlive: true,
        max: 5,
      },
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
