import "server-only";
import "reflect-metadata";
import { DataSource, type EntityTarget, type ObjectLiteral, type Repository } from "typeorm";
import { env } from "../env";
import { entities } from "./entities";
import { dataSourceOptions } from "./options";

const globalForDb = globalThis as unknown as {
  __focus_db?: Promise<DataSource>;
  __focus_entities?: unknown[];
};

/**
 * One DataSource per server instance, kept on globalThis so hot reloads and
 * warm serverless invocations reuse it. A reload that recreates the entity
 * classes gets a fresh DataSource, since TypeORM's metadata is tied to the
 * classes; the old one is closed a minute later, once its requests are done.
 */
export async function getDb(): Promise<DataSource> {
  if (globalForDb.__focus_db && globalForDb.__focus_entities !== entities) {
    const stale = globalForDb.__focus_db;
    globalForDb.__focus_db = undefined;
    setTimeout(() => void stale.then((ds) => ds.destroy()).catch(() => undefined), 60_000).unref?.();
  }

  if (!globalForDb.__focus_db) {
    const config = env();
    const dataSource = new DataSource(
      dataSourceOptions({ url: config.DATABASE_URL, ssl: config.DATABASE_SSL, logging: config.DATABASE_LOGGING }),
    );
    globalForDb.__focus_entities = entities;
    globalForDb.__focus_db = dataSource.initialize().catch((error) => {
      globalForDb.__focus_db = undefined;
      throw error;
    });
  }
  return globalForDb.__focus_db;
}

export async function repo<T extends ObjectLiteral>(target: EntityTarget<T>): Promise<Repository<T>> {
  return (await getDb()).getRepository(target);
}
