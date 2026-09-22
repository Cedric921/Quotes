import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/** A database on this machine — no TLS, and nothing to pool through. */
export function isLocalDatabase(url: string): boolean {
  return /@(localhost|127\.0\.0\.1|\[::1\])(:|\/)/.test(url);
}

/**
 * Database configuration - uses DATABASE_URL (Supabase Session Pooler)
 *
 * SSL is on for anything remote and off for a local server: Postgres on the
 * developer's own machine has no certificate and refuses the handshake
 * outright, which made running the API locally impossible.
 */
export function getDatabaseConfig(): TypeOrmModuleOptions {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const local = isLocalDatabase(databaseUrl);
  console.log(`🐘 Connecting to PostgreSQL${local ? ' (local)' : ''}...`);

  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    ssl: local ? false : { rejectUnauthorized: false },
    logging: process.env.NODE_ENV !== 'production',
  };
}

/**
 * Get current database type for health checks
 */
export function getDatabaseType(): 'postgres' {
  return 'postgres';
}
