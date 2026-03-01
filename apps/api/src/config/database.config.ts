import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dns from 'dns';

// Force Node.js to prefer IPv4 addresses
dns.setDefaultResultOrder('ipv4first');

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
    port: number,
    password: string,
    username = 'postgres',
    database = 'postgres',
  ): TypeOrmModuleOptions => ({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    ssl: { rejectUnauthorized: false },
    logging: process.env.NODE_ENV !== 'production',
    extra: {
      // Force IPv4 to avoid IPv6 connection issues on Render
      family: 4,
    },
    // Connection pooling settings for serverless environments
    poolSize: 10,
    connectTimeoutMS: 30000,
  });

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
    };
  }

  // Option 1: Use DATABASE_URL directly (full connection string)
  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    // Mask password in URL for logging
    const maskedUrl = databaseUrl.replace(
      /(:\/\/[^:]+:)([^@]+)(@)/,
      '$1****$3',
    );
    console.log('🐘 Using PostgreSQL from DATABASE_URL');
    console.log(`📍 Database URL: ${maskedUrl}`);

    // Parse the URL to extract connection details
    try {
      const url = new URL(databaseUrl);
      const host = url.hostname;
      const port = parseInt(url.port, 10) || 5432;
      const password = decodeURIComponent(url.password);
      const username = url.username || 'postgres';
      const database = url.pathname.replace('/', '') || 'postgres';

      console.log(`📍 Host: ${host}, Port: ${port}`);

      return getPostgresOptions(host, port, password, username, database);
    } catch (err) {
      console.error('Failed to parse DATABASE_URL, using raw connection');
      // If URL parsing fails, use basic config with extra options
      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        ssl: { rejectUnauthorized: false },
        logging: process.env.NODE_ENV !== 'production',
        extra: { family: 4 },
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
      // Use direct connection with IPv4 preference
      const host = `db.${projectRef}.supabase.co`;
      console.log(`🐘 Using Supabase PostgreSQL (${host})`);

      return getPostgresOptions(host, 5432, supabaseDbPassword);
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
