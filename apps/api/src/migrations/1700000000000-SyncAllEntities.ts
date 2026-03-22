import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to synchronize all entities with the production database.
 * This creates all missing tables and columns based on the current entity definitions.
 */
export class SyncAllEntities1700000000000 implements MigrationInterface {
  name = 'SyncAllEntities1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension for UUID generation
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ==========================================
    // Create base tables if they don't exist
    // ==========================================

    // Topic table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "topic" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "name" varchar NOT NULL,
        "title" varchar,
        "description" varchar,
        "icon" varchar,
        "color" varchar,
        "isPremium" boolean DEFAULT false NOT NULL,
        CONSTRAINT "PK_topic" PRIMARY KEY ("id")
      )
    `);

    // Quote table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quote" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "text" varchar NOT NULL,
        "author" varchar,
        "topicId" uuid,
        CONSTRAINT "PK_quote" PRIMARY KEY ("id"),
        CONSTRAINT "FK_quote_topic" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE NO ACTION
      )
    `);

    // User table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "email" varchar NOT NULL,
        "password" varchar,
        "name" varchar,
        "avatar" varchar,
        "isAdmin" boolean DEFAULT false NOT NULL,
        "isSubscribed" boolean DEFAULT false NOT NULL,
        "subscriptionEndDate" date,
        CONSTRAINT "PK_user" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_email" UNIQUE ("email")
      )
    `);

    // Font table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "font" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "name" varchar NOT NULL,
        "fontFamily" varchar NOT NULL,
        "description" varchar,
        "previewText" varchar,
        "isActive" boolean DEFAULT true NOT NULL,
        "order" integer DEFAULT 0 NOT NULL,
        "isPremium" boolean DEFAULT true NOT NULL,
        CONSTRAINT "PK_font" PRIMARY KEY ("id")
      )
    `);

    // Theme table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "theme" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "name" varchar NOT NULL,
        "description" text,
        "imageUrl" varchar NOT NULL,
        "thumbnailUrl" varchar,
        "cloudinaryPublicId" varchar,
        "isActive" boolean DEFAULT true NOT NULL,
        "order" integer DEFAULT 0 NOT NULL,
        "fontName" varchar,
        "fontFamily" varchar,
        "isPremium" boolean DEFAULT false NOT NULL,
        CONSTRAINT "PK_theme" PRIMARY KEY ("id")
      )
    `);

    // Subscription Plan table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_plan" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "name" varchar NOT NULL,
        "description" text,
        "price" decimal(10,2) NOT NULL,
        "durationMonths" integer DEFAULT 1 NOT NULL,
        "isActive" boolean DEFAULT true NOT NULL,
        CONSTRAINT "PK_subscription_plan" PRIMARY KEY ("id")
      )
    `);

    // Subscription table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "userId" uuid NOT NULL,
        "planId" uuid NOT NULL,
        "status" varchar DEFAULT 'active' NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "stripePaymentIntentId" varchar,
        "amountPaid" decimal(10,2) NOT NULL,
        CONSTRAINT "PK_subscription" PRIMARY KEY ("id"),
        CONSTRAINT "FK_subscription_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_subscription_plan" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE NO ACTION
      )
    `);

    // AppConfig table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "app_config" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "key" varchar NOT NULL,
        "value" text NOT NULL,
        "description" text,
        CONSTRAINT "PK_app_config" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_app_config_key" UNIQUE ("key")
      )
    `);

    // UserNotificationSettings table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_notification_settings" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "userId" uuid NOT NULL,
        "enabled" boolean DEFAULT false NOT NULL,
        "notifications" text DEFAULT '[{"time":"09:00","days":[0,1,2,3,4,5,6]},{"time":"18:00","days":[0,1,2,3,4,5,6]}]' NOT NULL,
        "timezone" varchar DEFAULT 'UTC' NOT NULL,
        CONSTRAINT "PK_user_notification_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_notification_settings_user" UNIQUE ("userId"),
        CONSTRAINT "FK_user_notification_settings_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    // UserActivity table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_activity" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "userId" uuid NOT NULL,
        "date" date NOT NULL,
        "openCount" integer DEFAULT 1 NOT NULL,
        "lastOpenedAt" TIMESTAMP DEFAULT now() NOT NULL,
        CONSTRAINT "PK_user_activity" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_activity_user_date" UNIQUE ("userId", "date"),
        CONSTRAINT "FK_user_activity_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    // PushToken table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "push_token" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "userId" uuid NOT NULL,
        "token" varchar NOT NULL,
        "deviceId" varchar,
        "platform" varchar,
        "lastUsedAt" TIMESTAMP,
        "isActive" boolean DEFAULT true NOT NULL,
        CONSTRAINT "PK_push_token" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_push_token_token" UNIQUE ("token"),
        CONSTRAINT "FK_push_token_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    // User-Topic many-to-many junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_favorite_topics_topic" (
        "userId" uuid NOT NULL,
        "topicId" uuid NOT NULL,
        CONSTRAINT "PK_user_favorite_topics" PRIMARY KEY ("userId", "topicId"),
        CONSTRAINT "FK_user_favorite_topics_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_favorite_topics_topic" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE CASCADE
      )
    `);

    // User-Quote (liked) many-to-many junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_liked_quotes_quote" (
        "userId" uuid NOT NULL,
        "quoteId" uuid NOT NULL,
        CONSTRAINT "PK_user_liked_quotes" PRIMARY KEY ("userId", "quoteId"),
        CONSTRAINT "FK_user_liked_quotes_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_liked_quotes_quote" FOREIGN KEY ("quoteId") REFERENCES "quote"("id") ON DELETE CASCADE
      )
    `);

    // ==========================================
    // Create indexes
    // ==========================================
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_push_token_userId" ON "push_token" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_push_token_token" ON "push_token" ("token")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_activity_userId_date" ON "user_activity" ("userId", "date")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_favorite_topics_userId" ON "user_favorite_topics_topic" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_favorite_topics_topicId" ON "user_favorite_topics_topic" ("topicId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_liked_quotes_userId" ON "user_liked_quotes_quote" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_liked_quotes_quoteId" ON "user_liked_quotes_quote" ("quoteId")`,
    );

    console.log('✅ All entities synchronized successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign key constraints)
    await queryRunner.query(`DROP TABLE IF EXISTS "user_liked_quotes_quote"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "user_favorite_topics_topic"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "push_token"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_activity"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "user_notification_settings"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "app_config"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plan"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "theme"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "font"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quote"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "topic"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);

    console.log('✅ All tables dropped!');
  }
}
