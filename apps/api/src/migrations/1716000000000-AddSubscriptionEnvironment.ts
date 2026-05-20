import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add environment ('PRODUCTION' | 'SANDBOX') to subscription.
 * Allows the admin panel to filter real customer data vs. TestFlight /
 * Stripe-test / Play-test sandbox subscriptions.
 *
 * Backfill rules:
 * - subscriptions whose stripePaymentIntentId starts with 'rc_' AND whose
 *   amountPaid = 0 are treated as SANDBOX (RevenueCat sandbox events default
 *   to price 0 in our webhook handler).
 * - everything else is treated as PRODUCTION (existing real data stays
 *   visible by default once the dashboard toggle is added).
 */
export class AddSubscriptionEnvironment1716000000000
  implements MigrationInterface
{
  name = 'AddSubscriptionEnvironment1716000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnExists = async (
      table: string,
      column: string,
    ): Promise<boolean> => {
      const result = await queryRunner.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = '${table}' AND column_name = '${column}'
      `);
      return result.length > 0;
    };

    console.log('🔄 Adding environment column to "subscription" table...');

    if (!(await columnExists('subscription', 'environment'))) {
      await queryRunner.query(
        `ALTER TABLE "subscription" ADD "environment" varchar NOT NULL DEFAULT 'PRODUCTION'`,
      );
      console.log('  ✓ Added environment (default PRODUCTION)');

      // Backfill: heuristic SANDBOX for RevenueCat rows with price 0
      const result = await queryRunner.query(`
        UPDATE "subscription"
        SET "environment" = 'SANDBOX'
        WHERE "stripePaymentIntentId" LIKE 'rc_%'
          AND ("amountPaid" IS NULL OR "amountPaid" = 0)
      `);
      console.log(
        `  ✓ Backfilled SANDBOX on ${result?.[1] ?? 0} RevenueCat rows`,
      );
    }

    console.log('✅ subscription.environment ready!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN IF EXISTS "environment"`,
    );
  }
}
