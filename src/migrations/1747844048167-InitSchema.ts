import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1747844048167 implements MigrationInterface {
    name = 'InitSchema1747844048167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "place" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying, "country" character varying NOT NULL, "city" character varying NOT NULL, "tags" text array NOT NULL DEFAULT '{}', "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "imageUrl" character varying, "imagePublicId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, CONSTRAINT "PK_96ab91d43aa89c5de1b59ee7cca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment_vote" ("id" SERIAL NOT NULL, "isLike" boolean NOT NULL, "userId" integer, "commentId" integer, CONSTRAINT "UQ_9194f426d41fb9a8abc3aae5114" UNIQUE ("userId", "commentId"), CONSTRAINT "PK_4b5d08afceeb89bd5da77cfd71f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "text" text NOT NULL, "likes" integer NOT NULL DEFAULT '0', "dislikes" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "placeId" integer, "parentCommentId" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "place" ADD CONSTRAINT "FK_028768ecb4d1deee64c1dccdb95" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_vote" ADD CONSTRAINT "FK_ade7498b89296b9fb63bcd8dbdd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_vote" ADD CONSTRAINT "FK_5d77d92a6925ae3fc8da14e1257" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_626b946a1fa685a361665ccb238" FOREIGN KEY ("placeId") REFERENCES "place"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_73aac6035a70c5f0313c939f237" FOREIGN KEY ("parentCommentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_73aac6035a70c5f0313c939f237"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_626b946a1fa685a361665ccb238"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`);
        await queryRunner.query(`ALTER TABLE "comment_vote" DROP CONSTRAINT "FK_5d77d92a6925ae3fc8da14e1257"`);
        await queryRunner.query(`ALTER TABLE "comment_vote" DROP CONSTRAINT "FK_ade7498b89296b9fb63bcd8dbdd"`);
        await queryRunner.query(`ALTER TABLE "place" DROP CONSTRAINT "FK_028768ecb4d1deee64c1dccdb95"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "comment_vote"`);
        await queryRunner.query(`DROP TABLE "place"`);
    }

}
