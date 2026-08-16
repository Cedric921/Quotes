import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add social_networks and contact_messages tables.
 */
export class AddSocialAndContactTables1710300000000
  implements MigrationInterface
{
  name = 'AddSocialAndContactTables1710300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension for UUID generation
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ==========================================
    // Create social_networks table
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "social_networks" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "name" varchar NOT NULL,
        "url" varchar NOT NULL,
        "icon" varchar NOT NULL,
        "color" varchar,
        "isActive" boolean DEFAULT true NOT NULL,
        "order" integer DEFAULT 0 NOT NULL,
        CONSTRAINT "PK_social_networks" PRIMARY KEY ("id")
      )
    `);

    // ==========================================
    // Create contact_messages table
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "contact_messages" (
        "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "name" varchar NOT NULL,
        "email" varchar NOT NULL,
        "subject" varchar NOT NULL,
        "message" text NOT NULL,
        "status" varchar DEFAULT 'UNREAD' NOT NULL,
        "userId" uuid,
        CONSTRAINT "PK_contact_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_contact_messages_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_social_networks_isActive" ON "social_networks" ("isActive")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_contact_messages_status" ON "contact_messages" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_contact_messages_userId" ON "contact_messages" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_contact_messages_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_contact_messages_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_social_networks_isActive"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "social_networks"`);
  }
}

