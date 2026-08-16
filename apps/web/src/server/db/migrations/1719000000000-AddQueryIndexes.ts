import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Les index qui manquaient sous les requetes les plus chaudes.
 *
 * Postgres n'indexe pas automatiquement les colonnes de cle etrangere : filtrer
 * les citations par sujet - ce que fait l'ecran Topics a chaque ouverture -
 * balayait donc la table entiere. Meme chose pour le tri par date, qui est
 * l'ordre par defaut du flux et se paie a chaque page.
 *
 * Les tables de jonction, elles, etaient deja couvertes par la migration
 * initiale ; rien a ajouter de ce cote.
 */
export class AddQueryIndexes1719000000000 implements MigrationInterface {
  name = 'AddQueryIndexes1719000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_quote_topicId" ON "quote" ("topicId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_quote_createdAt" ON "quote" ("createdAt" DESC)`,
    );
    // Le compteur de favoris et la liste des favoris partent tous deux de
    // l'utilisateur ; l'ordre des colonnes suit celui de la lecture.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_liked_quotes_userId_quoteId" ON "user_liked_quotes_quote" ("userId", "quoteId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_liked_quotes_userId_quoteId"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_quote_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_quote_topicId"`);
  }
}
