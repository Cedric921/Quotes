import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database configuration - uses DATABASE_URL (Supabase Session Pooler)
 */
export function getDatabaseConfig(): TypeOrmModuleOptions {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  console.log('🐘 Connecting to PostgreSQL...');

  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    ssl: { rejectUnauthorized: false },
    logging: process.env.NODE_ENV !== 'production',
  };
}

/**
 * Get current database type for health checks
 */
export function getDatabaseType(): 'postgres' {
  return 'postgres';
}
