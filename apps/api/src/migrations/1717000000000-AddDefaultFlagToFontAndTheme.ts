import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add isDefault flag on font + theme. Admins can mark exactly one
 * active font and one active theme as default — these are applied on first
 * launch of the mobile app for any user who hasn't picked their own yet.
 *
 * Backfill: the first active font (by order asc) becomes default, same for
 * theme. If no active row exists, nothing is marked default.
 */
export class AddDefaultFlagToFontAndTheme1717000000000
  implements MigrationInterface
{
  name = 'AddDefaultFlagToFontAndTheme1717000000000';

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

    console.log('🔄 Adding isDefault columns to "font" and "theme"...');

    if (!(await columnExists('font', 'isDefault'))) {
      await queryRunner.query(
        `ALTER TABLE "font" ADD "isDefault" boolean NOT NULL DEFAULT false`,
      );
      console.log('  ✓ font.isDefault added');

      // Backfill: first active font (lowest order, oldest) becomes default
      await queryRunner.query(`
        UPDATE "font" SET "isDefault" = true
        WHERE "id" = (
          SELECT "id" FROM "font"
          WHERE "isActive" = true
          ORDER BY "order" ASC, "createdAt" ASC
          LIMIT 1
        )
      `);
      console.log('  ✓ font.isDefault backfilled');
    }

    if (!(await columnExists('theme', 'isDefault'))) {
      await queryRunner.query(
        `ALTER TABLE "theme" ADD "isDefault" boolean NOT NULL DEFAULT false`,
      );
      console.log('  ✓ theme.isDefault added');

      await queryRunner.query(`
        UPDATE "theme" SET "isDefault" = true
        WHERE "id" = (
          SELECT "id" FROM "theme"
          WHERE "isActive" = true
          ORDER BY "order" ASC, "createdAt" ASC
          LIMIT 1
        )
      `);
      console.log('  ✓ theme.isDefault backfilled');
    }

    console.log('✅ Default flags ready on font + theme!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "font" DROP COLUMN IF EXISTS "isDefault"`,
    );
    await queryRunner.query(
      `ALTER TABLE "theme" DROP COLUMN IF EXISTS "isDefault"`,
    );
  }
}
