import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertIdsToUuid1707100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Note: SQLite doesn't support ALTER COLUMN, so we need to recreate tables
    // This migration will drop all existing data and recreate tables with UUID

    console.log('⚠️  WARNING: This migration will drop all existing data!');
    console.log('🔄 Converting IDs to UUID...');

    // Drop all tables
    await queryRunner.query(`DROP TABLE IF EXISTS "user_favorite_topics_topic"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_liked_quotes_quote"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quote"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "topic"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);

    // Recreate Topic table with UUID
    await queryRunner.query(`
      CREATE TABLE "topic" (
        "id" varchar PRIMARY KEY NOT NULL,
        "name" varchar NOT NULL,
        "title" varchar,
        "description" varchar,
        "icon" varchar,
        "color" varchar,
        "isPremium" boolean NOT NULL DEFAULT (0),
        "deletedAt" datetime
      )
    `);

    // Recreate Quote table with UUID
    await queryRunner.query(`
      CREATE TABLE "quote" (
        "id" varchar PRIMARY KEY NOT NULL,
        "text" varchar NOT NULL,
        "author" varchar,
        "deletedAt" datetime,
        "topicId" varchar,
        CONSTRAINT "FK_quote_topic" FOREIGN KEY ("topicId") REFERENCES "topic" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Recreate User table with UUID
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" varchar PRIMARY KEY NOT NULL,
        "email" varchar NOT NULL,
        "password" varchar,
        "isAdmin" boolean NOT NULL DEFAULT (0),
        "isSubscribed" boolean NOT NULL DEFAULT (0),
        "subscriptionEndDate" date,
        CONSTRAINT "UQ_user_email" UNIQUE ("email")
      )
    `);

    // Recreate junction tables
    await queryRunner.query(`
      CREATE TABLE "user_favorite_topics_topic" (
        "userId" varchar NOT NULL,
        "topicId" varchar NOT NULL,
        PRIMARY KEY ("userId", "topicId"),
        CONSTRAINT "FK_user_favorite_topics_user" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_user_favorite_topics_topic" FOREIGN KEY ("topicId") REFERENCES "topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_liked_quotes_quote" (
        "userId" varchar NOT NULL,
        "quoteId" varchar NOT NULL,
        PRIMARY KEY ("userId", "quoteId"),
        CONSTRAINT "FK_user_liked_quotes_user" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_user_liked_quotes_quote" FOREIGN KEY ("quoteId") REFERENCES "quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_user_favorite_topics_user" ON "user_favorite_topics_topic" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_favorite_topics_topic" ON "user_favorite_topics_topic" ("topicId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_liked_quotes_user" ON "user_liked_quotes_quote" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_liked_quotes_quote" ON "user_liked_quotes_quote" ("quoteId")`,
    );

    console.log('✅ Migration completed successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration is not reversible as it drops all data
    console.log('⚠️  This migration cannot be reversed!');
    throw new Error('Cannot revert UUID migration - data has been lost');
  }
}

