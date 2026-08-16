import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTopicFields1707000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helper function to check if column exists
    const columnExists = async (
      table: string,
      column: string,
    ): Promise<boolean> => {
      const result = await queryRunner.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = '${table}' AND column_name = '${column}'
      `);
      return result.length > 0;
    };

    // Add title column if not exists
    if (!(await columnExists('topic', 'title'))) {
      await queryRunner.query(`ALTER TABLE "topic" ADD "title" varchar`);
    }

    // Add icon column if not exists
    if (!(await columnExists('topic', 'icon'))) {
      await queryRunner.query(`ALTER TABLE "topic" ADD "icon" varchar`);
    }

    // Add color column if not exists
    if (!(await columnExists('topic', 'color'))) {
      await queryRunner.query(`ALTER TABLE "topic" ADD "color" varchar`);
    }

    // Add isPremium column if not exists
    if (!(await columnExists('topic', 'isPremium'))) {
      await queryRunner.query(
        `ALTER TABLE "topic" ADD "isPremium" boolean DEFAULT false`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "topic" DROP COLUMN IF EXISTS "title"`,
    );
    await queryRunner.query(`ALTER TABLE "topic" DROP COLUMN IF EXISTS "icon"`);
    await queryRunner.query(
      `ALTER TABLE "topic" DROP COLUMN IF EXISTS "color"`,
    );
    await queryRunner.query(
      `ALTER TABLE "topic" DROP COLUMN IF EXISTS "isPremium"`,
    );
  }
}
