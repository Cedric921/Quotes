import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database configuration factory
 * Supports Supabase (PostgreSQL) as primary and SQLite as fallback
 */
export function getDatabaseConfig(): TypeOrmModuleOptions {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseDbPassword = process.env.SUPABASE_DB_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  // Option 1: Use DATABASE_URL directly (full connection string)
  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    console.log('🐘 Using PostgreSQL from DATABASE_URL');
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      logging: process.env.NODE_ENV !== 'production',
    };
  }

  // Option 2: Use Supabase credentials
  if (supabaseUrl && supabaseDbPassword) {
    // Extract project ref from Supabase URL
    // URL format: https://<project-ref>.supabase.co
    const projectRef = supabaseUrl.match(
      /https:\/\/([^.]+)\.supabase\.co/,
    )?.[1];

    if (projectRef) {
      console.log('🐘 Using Supabase PostgreSQL');
      return {
        type: 'postgres',
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        username: 'postgres',
        password: supabaseDbPassword,
        database: 'postgres',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        ssl: { rejectUnauthorized: false },
        logging: process.env.NODE_ENV !== 'production',
      };
    }
  }

  // Option 3: Fallback to SQLite
  console.log('📦 Using SQLite (fallback)');
  return {
    type: 'sqlite',
    database: process.env.SQLITE_DATABASE || 'database.sqlite',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: process.env.NODE_ENV !== 'production',
  };
}

/**
 * Get current database type for health checks
 */
export function getDatabaseType(): 'postgres' | 'sqlite' {
  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseDbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (
    (databaseUrl && databaseUrl.startsWith('postgres')) ||
    (supabaseUrl && supabaseDbPassword)
  ) {
    return 'postgres';
  }
  return 'sqlite';
}

/**
 * Check if using Supabase
 */
export function isUsingSupabase(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD);
}

