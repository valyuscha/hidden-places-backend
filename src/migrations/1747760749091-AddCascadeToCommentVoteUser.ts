import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeToCommentVoteUser1680000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "comment_vote"
      DROP CONSTRAINT IF EXISTS "FK_5d77d92a6925ae3fc8da14e1257";

      ALTER TABLE "comment_vote"
      ADD CONSTRAINT "FK_5d77d92a6925ae3fc8da14e1257"
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "comment_vote"
      DROP CONSTRAINT "FK_5d77d92a6925ae3fc8da14e1257";

      ALTER TABLE "comment_vote"
      ADD CONSTRAINT "FK_5d77d92a6925ae3fc8da14e1257"
      FOREIGN KEY ("userId") REFERENCES "user"("id");
    `);
    }
}
