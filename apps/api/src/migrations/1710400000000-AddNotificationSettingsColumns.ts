import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add missing columns to user_notification_settings table.
 */
export class AddNotificationSettingsColumns1710400000000
  implements MigrationInterface
{
  name = 'AddNotificationSettingsColumns1710400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists first
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_notification_settings'
      );
    `);

    if (!tableExists[0]?.exists) {
      // Create the table if it doesn't exist
      await queryRunner.query(`
        CREATE TABLE "user_notification_settings" (
          "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
          "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
          "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
          "deletedAt" TIMESTAMP,
          "userId" uuid NOT NULL,
          "enabled" boolean DEFAULT false NOT NULL,
          "startTime" varchar DEFAULT '09:00' NOT NULL,
          "endTime" varchar DEFAULT '18:00' NOT NULL,
          "maxNotificationsPerDay" integer DEFAULT 3 NOT NULL,
          "activeDays" text DEFAULT '[0,1,2,3,4,5,6]' NOT NULL,
          "timezone" varchar DEFAULT 'UTC' NOT NULL,
          "dailyNotificationTracker" text DEFAULT '{"date":"","count":0,"times":[]}' NOT NULL,
          CONSTRAINT "PK_user_notification_settings" PRIMARY KEY ("id"),
          CONSTRAINT "FK_user_notification_settings_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
        )
      `);
    } else {
      // Add missing columns if they don't exist
      // startTime column
      const startTimeExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'user_notification_settings' 
          AND column_name = 'startTime'
        );
      `);
      if (!startTimeExists[0]?.exists) {
        await queryRunner.query(`
          ALTER TABLE "user_notification_settings" 
          ADD COLUMN "startTime" varchar DEFAULT '09:00' NOT NULL
        `);
      }

      // endTime column
      const endTimeExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'user_notification_settings' 
          AND column_name = 'endTime'
        );
      `);
      if (!endTimeExists[0]?.exists) {
        await queryRunner.query(`
          ALTER TABLE "user_notification_settings" 
          ADD COLUMN "endTime" varchar DEFAULT '18:00' NOT NULL
        `);
      }

      // maxNotificationsPerDay column
      const maxNotifExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'user_notification_settings' 
          AND column_name = 'maxNotificationsPerDay'
        );
      `);
      if (!maxNotifExists[0]?.exists) {
        await queryRunner.query(`
          ALTER TABLE "user_notification_settings" 
          ADD COLUMN "maxNotificationsPerDay" integer DEFAULT 3 NOT NULL
        `);
      }

      // activeDays column
      const activeDaysExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'user_notification_settings' 
          AND column_name = 'activeDays'
        );
      `);
      if (!activeDaysExists[0]?.exists) {
        await queryRunner.query(`
          ALTER TABLE "user_notification_settings" 
          ADD COLUMN "activeDays" text DEFAULT '[0,1,2,3,4,5,6]' NOT NULL
        `);
      }

      // timezone column
      const timezoneExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'user_notification_settings' 
          AND column_name = 'timezone'
        );
      `);
      if (!timezoneExists[0]?.exists) {
        await queryRunner.query(`
          ALTER TABLE "user_notification_settings" 
          ADD COLUMN "timezone" varchar DEFAULT 'UTC' NOT NULL
        `);
      }

      // dailyNotificationTracker column
      const trackerExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'user_notification_settings' 
          AND column_name = 'dailyNotificationTracker'
        );
      `);
      if (!trackerExists[0]?.exists) {
        await queryRunner.query(`
          ALTER TABLE "user_notification_settings" 
          ADD COLUMN "dailyNotificationTracker" text DEFAULT '{"date":"","count":0,"times":[]}' NOT NULL
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // We don't drop the columns in down migration to avoid data loss
    // If needed, uncomment the following:
    // await queryRunner.query(`ALTER TABLE "user_notification_settings" DROP COLUMN IF EXISTS "startTime"`);
    // await queryRunner.query(`ALTER TABLE "user_notification_settings" DROP COLUMN IF EXISTS "endTime"`);
    // await queryRunner.query(`ALTER TABLE "user_notification_settings" DROP COLUMN IF EXISTS "maxNotificationsPerDay"`);
    // await queryRunner.query(`ALTER TABLE "user_notification_settings" DROP COLUMN IF EXISTS "activeDays"`);
    // await queryRunner.query(`ALTER TABLE "user_notification_settings" DROP COLUMN IF EXISTS "timezone"`);
    // await queryRunner.query(`ALTER TABLE "user_notification_settings" DROP COLUMN IF EXISTS "dailyNotificationTracker"`);
  }
}

