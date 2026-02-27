import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database configuration factory
 * Supports Supabase (PostgreSQL) as primary and SQLite as fallback
 */
export function getDatabaseConfig(): TypeOrmModuleOptions {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseDbPassword = process.env.SUPABASE_DB_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  // Common PostgreSQL options for Supabase
  const getPostgresOptions = (
    host: string,
    password: string,
  ): TypeOrmModuleOptions => ({
    type: 'postgres',
    host,
    port: 5432,
    username: 'postgres',
    password,
    database: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    ssl: { rejectUnauthorized: false },
    logging: process.env.NODE_ENV !== 'production',
    extra: {
      // Force IPv4 to avoid IPv6 connection issues
      family: 4,
    },
  });

  // Option 1: Use DATABASE_URL directly (full connection string)
  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    // Mask password in URL for logging
    const maskedUrl = databaseUrl.replace(
      /(:\/\/[^:]+:)([^@]+)(@)/,
      '$1****$3',
    );
    console.log('🐘 Using PostgreSQL from DATABASE_URL');
    console.log(`📍 Database URL: ${maskedUrl}`);

    // Parse the URL to extract host and password for extra options
    try {
      const url = new URL(databaseUrl);
      const host = url.hostname;
      const password = decodeURIComponent(url.password);

      return {
        ...getPostgresOptions(host, password),
        url: databaseUrl,
        // Override host/password since we're using URL
        host: undefined,
        password: undefined,
      } as TypeOrmModuleOptions;
    } catch {
      // If URL parsing fails, use basic config
      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        ssl: { rejectUnauthorized: false },
        logging: process.env.NODE_ENV !== 'production',
      };
    }
  }

  // Option 2: Use Supabase credentials
  if (supabaseUrl && supabaseDbPassword) {
    // Extract project ref from Supabase URL
    // URL format: https://<project-ref>.supabase.co
    const projectRef = supabaseUrl.match(
      /https:\/\/([^.]+)\.supabase\.co/,
    )?.[1];

    if (projectRef) {
      // Use the pooler connection for better compatibility (supports IPv4)
      // Direct: db.xxx.supabase.co (may have IPv6 issues)
      // Pooler: aws-0-eu-central-1.pooler.supabase.com (more reliable)
      const host = `db.${projectRef}.supabase.co`;
      console.log(`🐘 Using Supabase PostgreSQL (${host})`);

      return getPostgresOptions(host, supabaseDbPassword);
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
