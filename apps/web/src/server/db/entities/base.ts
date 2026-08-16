import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * The columns every table shares, as the NestJS API declared them.
 *
 * Column types are spelled out on every entity: Next.js compiles without
 * `emitDecoratorMetadata`, so TypeORM cannot read a property's type and would
 * otherwise guess wrong. The names and types match the schema already in the
 * database; nothing here is meant to change it.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
