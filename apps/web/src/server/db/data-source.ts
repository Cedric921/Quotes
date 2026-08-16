/**
 * DataSource for the TypeORM CLI (`npm run db:migrate --workspace web`).
 * The Next.js runtime uses `getDb()` from ./index instead.
 *
 * Migrations go through the direct connection when there is one: DDL inside a
 * transaction does not belong on a transaction pooler.
 */
import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { dataSourceOptions } from "./options";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

export default new DataSource(
  dataSourceOptions({
    url,
    ssl: (process.env.DATABASE_SSL ?? "true") === "true",
    logging: process.env.DATABASE_LOGGING === "true",
  }),
);
