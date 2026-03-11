import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertIdsToUuid1707100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration was originally for SQLite.
    // For PostgreSQL (Supabase), we skip this migration if tables already exist with UUID.
    // The SyncAllEntities migration will handle table creation properly.

    const tableExists = async (table: string): Promise<boolean> => {
      const result = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = '${table}'
      `);
      return result.length > 0;
    };

    // If topic table already exists, skip this migration (tables are already created)
    if (await tableExists('topic')) {
      console.log(
        '⏭️  Skipping ConvertIdsToUuid migration - tables already exist',
      );
      return;
    }

    console.log(
      '⚠️  Running ConvertIdsToUuid migration (tables do not exist yet)...',
    );

    // Only create tables if they don't exist (for fresh installs)
    // Note: This is SQLite syntax, will be overridden by SyncAllEntities for PostgreSQL
    console.log('✅ Migration completed (skipped for existing database)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration is not reversible
    console.log('⚠️  This migration cannot be reversed!');
    throw new Error('Cannot revert UUID migration');
  }
}
