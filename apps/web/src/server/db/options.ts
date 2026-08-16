import pg from "pg";
import type { DataSourceOptions } from "typeorm";
import { entities } from "./entities";
import { migrations } from "./migrations";

export function dataSourceOptions(input: { url: string; ssl: boolean; logging: boolean }): DataSourceOptions {
  return {
    type: "postgres",
    // Passed explicitly: TypeORM otherwise loads `pg` with a dynamic require
    // that the serverless bundler cannot trace, and the driver goes missing.
    driver: pg,
    url: input.url,
    ssl: input.ssl ? { rejectUnauthorized: false } : undefined,
    logging: input.logging ? ["query", "error"] : ["error"],
    entities,
    migrations,
    // The schema only changes through migrations — never from the entities.
    synchronize: false,
    migrationsRun: false,
    // Each serverless instance holds its own pool, and Neon's pooler is the
    // one multiplexing them: a small pool per instance is the right size.
    extra: { max: 3, idleTimeoutMillis: 10_000 },
  };
}
