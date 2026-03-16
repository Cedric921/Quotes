import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to update existing tables with new columns.
 * Uses ALTER TABLE to add missing columns without dropping data.
 */
export class UpdateExistingTables1710200000001 implements MigrationInterface {
  name = 'UpdateExistingTables1710200000001';

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

    // Helper function to check if table exists
    const tableExists = async (table: string): Promise<boolean> => {
      const result = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = '${table}'
      `);
      return result.length > 0;
    };

    console.log('🔄 Updating existing tables with new columns...\n');

    // ==========================================
    // USER TABLE - Add missing columns
    // ==========================================
    if (await tableExists('user')) {
      console.log('📋 Updating "user" table...');

      if (!(await columnExists('user', 'createdAt'))) {
        await queryRunner.query(
          `ALTER TABLE "user" ADD "createdAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added createdAt');
      }
      if (!(await columnExists('user', 'updatedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "user" ADD "updatedAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added updatedAt');
      }
      if (!(await columnExists('user', 'deletedAt'))) {
        await queryRunner.query(`ALTER TABLE "user" ADD "deletedAt" TIMESTAMP`);
        console.log('  ✓ Added deletedAt');
      }
      if (!(await columnExists('user', 'name'))) {
        await queryRunner.query(`ALTER TABLE "user" ADD "name" varchar`);
        console.log('  ✓ Added name');
      }
      if (!(await columnExists('user', 'avatar'))) {
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar" varchar`);
        console.log('  ✓ Added avatar');
      }
    }

    // ==========================================
    // TOPIC TABLE - Add missing columns
    // ==========================================
    if (await tableExists('topic')) {
      console.log('📋 Updating "topic" table...');

      if (!(await columnExists('topic', 'createdAt'))) {
        await queryRunner.query(
          `ALTER TABLE "topic" ADD "createdAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added createdAt');
      }
      if (!(await columnExists('topic', 'updatedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "topic" ADD "updatedAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added updatedAt');
      }
      if (!(await columnExists('topic', 'title'))) {
        await queryRunner.query(`ALTER TABLE "topic" ADD "title" varchar`);
        console.log('  ✓ Added title');
      }
      if (!(await columnExists('topic', 'icon'))) {
        await queryRunner.query(`ALTER TABLE "topic" ADD "icon" varchar`);
        console.log('  ✓ Added icon');
      }
      if (!(await columnExists('topic', 'color'))) {
        await queryRunner.query(`ALTER TABLE "topic" ADD "color" varchar`);
        console.log('  ✓ Added color');
      }
      if (!(await columnExists('topic', 'isPremium'))) {
        await queryRunner.query(
          `ALTER TABLE "topic" ADD "isPremium" boolean DEFAULT false NOT NULL`,
        );
        console.log('  ✓ Added isPremium');
      }
    }

    // ==========================================
    // QUOTE TABLE - Add missing columns
    // ==========================================
    if (await tableExists('quote')) {
      console.log('📋 Updating "quote" table...');

      if (!(await columnExists('quote', 'createdAt'))) {
        await queryRunner.query(
          `ALTER TABLE "quote" ADD "createdAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added createdAt');
      }
      if (!(await columnExists('quote', 'updatedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "quote" ADD "updatedAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added updatedAt');
      }
    }

    // ==========================================
    // FONT TABLE - Add missing columns
    // ==========================================
    if (await tableExists('font')) {
      console.log('📋 Updating "font" table...');

      if (!(await columnExists('font', 'createdAt'))) {
        await queryRunner.query(
          `ALTER TABLE "font" ADD "createdAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added createdAt');
      }
      if (!(await columnExists('font', 'updatedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "font" ADD "updatedAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added updatedAt');
      }
      if (!(await columnExists('font', 'deletedAt'))) {
        await queryRunner.query(`ALTER TABLE "font" ADD "deletedAt" TIMESTAMP`);
        console.log('  ✓ Added deletedAt');
      }
      if (!(await columnExists('font', 'previewText'))) {
        await queryRunner.query(`ALTER TABLE "font" ADD "previewText" varchar`);
        console.log('  ✓ Added previewText');
      }
      if (!(await columnExists('font', 'isActive'))) {
        await queryRunner.query(
          `ALTER TABLE "font" ADD "isActive" boolean DEFAULT true NOT NULL`,
        );
        console.log('  ✓ Added isActive');
      }
      if (!(await columnExists('font', 'order'))) {
        await queryRunner.query(
          `ALTER TABLE "font" ADD "order" integer DEFAULT 0 NOT NULL`,
        );
        console.log('  ✓ Added order');
      }
      if (!(await columnExists('font', 'isPremium'))) {
        await queryRunner.query(
          `ALTER TABLE "font" ADD "isPremium" boolean DEFAULT true NOT NULL`,
        );
        console.log('  ✓ Added isPremium');
      }
    }

    // ==========================================
    // THEME TABLE - Add missing columns
    // ==========================================
    if (await tableExists('theme')) {
      console.log('📋 Updating "theme" table...');

      if (!(await columnExists('theme', 'createdAt'))) {
        await queryRunner.query(
          `ALTER TABLE "theme" ADD "createdAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added createdAt');
      }
      if (!(await columnExists('theme', 'updatedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "theme" ADD "updatedAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added updatedAt');
      }
      if (!(await columnExists('theme', 'deletedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "theme" ADD "deletedAt" TIMESTAMP`,
        );
        console.log('  ✓ Added deletedAt');
      }
      if (!(await columnExists('theme', 'thumbnailUrl'))) {
        await queryRunner.query(
          `ALTER TABLE "theme" ADD "thumbnailUrl" varchar`,
        );
        console.log('  ✓ Added thumbnailUrl');
      }
      if (!(await columnExists('theme', 'cloudinaryPublicId'))) {
        await queryRunner.query(
          `ALTER TABLE "theme" ADD "cloudinaryPublicId" varchar`,
        );
        console.log('  ✓ Added cloudinaryPublicId');
      }
      if (!(await columnExists('theme', 'isActive'))) {
        await queryRunner.query(
          `ALTER TABLE "theme" ADD "isActive" boolean DEFAULT true NOT NULL`,
        );
        console.log('  ✓ Added isActive');
      }
      if (!(await columnExists('theme', 'order'))) {
        await queryRunner.query(
          `ALTER TABLE "theme" ADD "order" integer DEFAULT 0 NOT NULL`,
        );
        console.log('  ✓ Added order');
      }
      if (!(await columnExists('theme', 'fontName'))) {
        await queryRunner.query(`ALTER TABLE "theme" ADD "fontName" varchar`);
        console.log('  ✓ Added fontName');
      }
      if (!(await columnExists('theme', 'fontFamily'))) {
        await queryRunner.query(`ALTER TABLE "theme" ADD "fontFamily" varchar`);
        console.log('  ✓ Added fontFamily');
      }
      if (!(await columnExists('theme', 'isPremium'))) {
        await queryRunner.query(
          `ALTER TABLE "theme" ADD "isPremium" boolean DEFAULT false NOT NULL`,
        );
        console.log('  ✓ Added isPremium');
      }
    }

    // ==========================================
    // SUBSCRIPTION_PLAN TABLE - Add missing columns
    // ==========================================
    if (await tableExists('subscription_plan')) {
      console.log('📋 Updating "subscription_plan" table...');

      if (!(await columnExists('subscription_plan', 'createdAt'))) {
        await queryRunner.query(
          `ALTER TABLE "subscription_plan" ADD "createdAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added createdAt');
      }
      if (!(await columnExists('subscription_plan', 'updatedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "subscription_plan" ADD "updatedAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added updatedAt');
      }
      if (!(await columnExists('subscription_plan', 'deletedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "subscription_plan" ADD "deletedAt" TIMESTAMP`,
        );
        console.log('  ✓ Added deletedAt');
      }
      if (!(await columnExists('subscription_plan', 'durationMonths'))) {
        await queryRunner.query(
          `ALTER TABLE "subscription_plan" ADD "durationMonths" integer DEFAULT 1 NOT NULL`,
        );
        console.log('  ✓ Added durationMonths');
      }
      if (!(await columnExists('subscription_plan', 'isActive'))) {
        await queryRunner.query(
          `ALTER TABLE "subscription_plan" ADD "isActive" boolean DEFAULT true NOT NULL`,
        );
        console.log('  ✓ Added isActive');
      }
    }

    // ==========================================
    // SUBSCRIPTION TABLE - Add missing columns
    // ==========================================
    if (await tableExists('subscription')) {
      console.log('📋 Updating "subscription" table...');

      if (!(await columnExists('subscription', 'createdAt'))) {
        await queryRunner.query(
          `ALTER TABLE "subscription" ADD "createdAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added createdAt');
      }
      if (!(await columnExists('subscription', 'updatedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "subscription" ADD "updatedAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added updatedAt');
      }
      if (!(await columnExists('subscription', 'deletedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "subscription" ADD "deletedAt" TIMESTAMP`,
        );
        console.log('  ✓ Added deletedAt');
      }
      if (!(await columnExists('subscription', 'stripePaymentIntentId'))) {
        await queryRunner.query(
          `ALTER TABLE "subscription" ADD "stripePaymentIntentId" varchar`,
        );
        console.log('  ✓ Added stripePaymentIntentId');
      }
    }

    // ==========================================
    // APP_CONFIG TABLE - Add missing columns
    // ==========================================
    if (await tableExists('app_config')) {
      console.log('📋 Updating "app_config" table...');

      if (!(await columnExists('app_config', 'createdAt'))) {
        await queryRunner.query(
          `ALTER TABLE "app_config" ADD "createdAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added createdAt');
      }
      if (!(await columnExists('app_config', 'updatedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "app_config" ADD "updatedAt" TIMESTAMP DEFAULT now() NOT NULL`,
        );
        console.log('  ✓ Added updatedAt');
      }
      if (!(await columnExists('app_config', 'deletedAt'))) {
        await queryRunner.query(
          `ALTER TABLE "app_config" ADD "deletedAt" TIMESTAMP`,
        );
        console.log('  ✓ Added deletedAt');
      }
    }

    console.log('\n✅ Existing tables updated successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: Dropping columns could result in data loss
    console.log(
      '⚠️  Reverting column additions - this may result in data loss!',
    );

    // User columns
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "avatar"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "name"`);

    // Topic columns
    await queryRunner.query(
      `ALTER TABLE "topic" DROP COLUMN IF EXISTS "isPremium"`,
    );
    await queryRunner.query(
      `ALTER TABLE "topic" DROP COLUMN IF EXISTS "color"`,
    );
    await queryRunner.query(`ALTER TABLE "topic" DROP COLUMN IF EXISTS "icon"`);
    await queryRunner.query(
      `ALTER TABLE "topic" DROP COLUMN IF EXISTS "title"`,
    );

    console.log('✅ Columns reverted!');
  }
}
