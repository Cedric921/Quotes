/**
 * Script to migrate data from source database to destination database
 * Migrates: themes, topics, quotes
 *
 * Usage: npx ts-node src/seeds/migrate-data.ts
 */

import { DataSource } from 'typeorm';

// Source database (your old database with data)
const SOURCE_DB_URL = process.env.SOURCE_DB_URL;

// Destination database (new database)
const DEST_DB_URL = process.env.DB_URL;

async function migrateData() {
  console.log('🚀 Starting data migration...\n');

  // Connect to source database
  const sourceDS = new DataSource({
    type: 'postgres',
    url: SOURCE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Connect to destination database
  const destDS = new DataSource({
    type: 'postgres',
    url: DEST_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await sourceDS.initialize();
    console.log('✅ Connected to SOURCE database');

    await destDS.initialize();
    console.log('✅ Connected to DESTINATION database\n');

    // Get admin user ID from destination
    const adminResult = await destDS.query(
      `SELECT id FROM "user" WHERE email = 'admin@focus.app' LIMIT 1`,
    );
    const adminId = adminResult[0]?.id;

    if (!adminId) {
      throw new Error(
        'Admin user not found in destination. Run db:seed:admin first.',
      );
    }
    console.log(`👤 Admin user ID: ${adminId}\n`);

    // ========================================
    // 1. Migrate THEMES
    // ========================================
    console.log('📦 Migrating THEMES...');
    const themes = await sourceDS.query(`SELECT * FROM "theme"`);
    console.log(`   Found ${themes.length} themes`);

    for (const theme of themes) {
      // Check if theme already exists
      const exists = await destDS.query(
        `SELECT id FROM "theme" WHERE name = $1`,
        [theme.name],
      );

      if (exists.length === 0) {
        await destDS.query(
          `INSERT INTO "theme" (
            "id", "name", "description", "imageUrl", "thumbnailUrl", 
            "cloudinaryPublicId", "isActive", "order", "fontName", 
            "fontFamily", "isPremium", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            theme.id,
            theme.name,
            theme.description,
            theme.imageUrl || 'https://placeholder.com/theme.jpg',
            theme.thumbnailUrl,
            theme.cloudinaryPublicId,
            theme.isActive ?? true,
            theme.order ?? 0,
            theme.fontName,
            theme.fontFamily,
            theme.isPremium ?? false,
            theme.createdAt || new Date(),
            theme.updatedAt || new Date(),
          ],
        );
        console.log(`   ✅ Inserted theme: ${theme.name}`);
      } else {
        console.log(`   ⏭️  Theme already exists: ${theme.name}`);
      }
    }

    // ========================================
    // 2. Migrate TOPICS
    // ========================================
    console.log('\n📦 Migrating TOPICS...');
    const topics = await sourceDS.query(`SELECT * FROM "topic"`);
    console.log(`   Found ${topics.length} topics`);

    for (const topic of topics) {
      const exists = await destDS.query(
        `SELECT id FROM "topic" WHERE name = $1`,
        [topic.name],
      );

      if (exists.length === 0) {
        await destDS.query(
          `INSERT INTO "topic" (
            "id", "name", "title", "description", "icon", "color", 
            "isPremium", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            topic.id,
            topic.name,
            topic.title,
            topic.description,
            topic.icon,
            topic.color,
            topic.isPremium ?? false,
            topic.createdAt || new Date(),
            topic.updatedAt || new Date(),
          ],
        );
        console.log(`   ✅ Inserted topic: ${topic.name}`);
      } else {
        console.log(`   ⏭️  Topic already exists: ${topic.name}`);
      }
    }

    // ========================================
    // 3. Migrate QUOTES
    // ========================================
    console.log('\n📦 Migrating QUOTES...');
    const quotes = await sourceDS.query(`SELECT * FROM "quote"`);
    console.log(`   Found ${quotes.length} quotes`);

    let insertedQuotes = 0;
    let skippedQuotes = 0;

    for (const quote of quotes) {
      // Check if quote already exists (by text)
      const exists = await destDS.query(
        `SELECT id FROM "quote" WHERE text = $1`,
        [quote.text],
      );

      if (exists.length === 0) {
        // Check if topicId exists in destination
        let topicId = quote.topicId;
        if (topicId) {
          const topicExists = await destDS.query(
            `SELECT id FROM "topic" WHERE id = $1`,
            [topicId],
          );
          if (topicExists.length === 0) {
            topicId = null; // Topic doesn't exist, set to null
          }
        }

        await destDS.query(
          `INSERT INTO "quote" (
            "id", "text", "author", "topicId", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            quote.id,
            quote.text,
            quote.author,
            topicId,
            quote.createdAt || new Date(),
            quote.updatedAt || new Date(),
          ],
        );
        insertedQuotes++;
      } else {
        skippedQuotes++;
      }
    }
    console.log(`   ✅ Inserted ${insertedQuotes} quotes`);
    console.log(`   ⏭️  Skipped ${skippedQuotes} existing quotes`);

    // ========================================
    // Summary
    // ========================================
    console.log('\n========================================');
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`   Themes: ${themes.length}`);
    console.log(`   Topics: ${topics.length}`);
    console.log(`   Quotes: ${insertedQuotes} inserted, ${skippedQuotes} skipped`);

    await sourceDS.destroy();
    await destDS.destroy();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateData();

