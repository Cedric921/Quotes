import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add promo code system for v1.0.4
 * 
 * Creates:
 * - promo_code table for storing promotional codes
 * - usedPromoCode column on user table to track which promo code was used
 */
export class AddPromoCodeSystem1718000000000 implements MigrationInterface {
  name = 'AddPromoCodeSystem1718000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = async (table: string): Promise<boolean> => {
      const result = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = '${table}'
      `);
      return result.length > 0;
    };

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

    console.log('🔄 Adding promo code system...');

    // Create promo_code table
    if (!(await tableExists('promo_code'))) {
      await queryRunner.query(`
        CREATE TABLE "promo_code" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "deletedAt" TIMESTAMP,
          "code" character varying NOT NULL,
          "expirationDate" date NOT NULL,
          "durationDays" integer NOT NULL,
          "usageCount" integer NOT NULL DEFAULT 0,
          "isActive" boolean NOT NULL DEFAULT true,
          "description" text,
          CONSTRAINT "UQ_promo_code_code" UNIQUE ("code"),
          CONSTRAINT "PK_promo_code_id" PRIMARY KEY ("id")
        )
      `);
      console.log('  ✓ promo_code table created');

      // Create index on code for faster lookups
      await queryRunner.query(`
        CREATE INDEX "IDX_promo_code_code" ON "promo_code" ("code")
      `);
      console.log('  ✓ Index on promo_code.code created');

      // Create index on isActive and expirationDate for validation queries
      await queryRunner.query(`
        CREATE INDEX "IDX_promo_code_active_expiration" 
        ON "promo_code" ("isActive", "expirationDate")
      `);
      console.log('  ✓ Index on promo_code.isActive+expirationDate created');
    }

    // Add usedPromoCode column to user table
    if (!(await columnExists('user', 'usedPromoCode'))) {
      await queryRunner.query(`
        ALTER TABLE "user" 
        ADD "usedPromoCode" character varying
      `);
      console.log('  ✓ user.usedPromoCode column added');

      // Add comment
      await queryRunner.query(`
        COMMENT ON COLUMN "user"."usedPromoCode" 
        IS 'Promo code used by this user for subscription'
      `);
      console.log('  ✓ Comment added to user.usedPromoCode');
    }

    console.log('✅ Promo code system ready!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back promo code system...');

    // Drop usedPromoCode column from user table
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN IF EXISTS "usedPromoCode"
    `);
    console.log('  ✓ user.usedPromoCode column dropped');

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_promo_code_active_expiration"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_promo_code_code"
    `);
    console.log('  ✓ Indexes dropped');

    // Drop promo_code table
    await queryRunner.query(`
      DROP TABLE IF EXISTS "promo_code"
    `);
    console.log('  ✓ promo_code table dropped');

    console.log('✅ Promo code system rolled back!');
  }
}
