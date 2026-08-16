import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add password reset fields to the user table.
 * - passwordResetCode: bcrypt-hashed reset code (varchar, nullable)
 * - passwordResetExpires: expiration timestamp for the reset code (nullable)
 */
export class AddPasswordResetFields1715000000000 implements MigrationInterface {
  name = 'AddPasswordResetFields1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

    console.log('🔄 Adding password reset fields to "user" table...');

    if (!(await columnExists('user', 'passwordResetCode'))) {
      await queryRunner.query(
        `ALTER TABLE "user" ADD "passwordResetCode" varchar`,
      );
      console.log('  ✓ Added passwordResetCode');
    }

    if (!(await columnExists('user', 'passwordResetExpires'))) {
      await queryRunner.query(
        `ALTER TABLE "user" ADD "passwordResetExpires" TIMESTAMP`,
      );
      console.log('  ✓ Added passwordResetExpires');
    }

    console.log('✅ Password reset fields ready!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "passwordResetExpires"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "passwordResetCode"`,
    );
  }
}
