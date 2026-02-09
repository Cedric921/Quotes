import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTopicFields1707000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add title column
    await queryRunner.addColumn(
      'topic',
      new TableColumn({
        name: 'title',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add icon column
    await queryRunner.addColumn(
      'topic',
      new TableColumn({
        name: 'icon',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add color column
    await queryRunner.addColumn(
      'topic',
      new TableColumn({
        name: 'color',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add isPremium column
    await queryRunner.addColumn(
      'topic',
      new TableColumn({
        name: 'isPremium',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('topic', 'title');
    await queryRunner.dropColumn('topic', 'icon');
    await queryRunner.dropColumn('topic', 'color');
    await queryRunner.dropColumn('topic', 'isPremium');
  }
}

