import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as fs from 'fs';
import * as path from 'path';
import { User, Place, Comment, CommentVote } from './entities';
import { UserModule } from './models/user/user.module';
import { PlaceModule } from './models/place/place.module';
import { CommentModule } from './models/comment/comment.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';

const caCertPath = path.join(process.cwd(), 'supabase-ca.crt');

if (!fs.existsSync(caCertPath)) {
  fs.writeFileSync(caCertPath, process.env.SUPABASE_CA_CERT!, { encoding: 'utf-8' });
}

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
      ssl: {
        ca: fs.readFileSync(path.resolve(process.cwd(), 'supabase-ca.crt')),
        rejectUnauthorized: true,
      },
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
