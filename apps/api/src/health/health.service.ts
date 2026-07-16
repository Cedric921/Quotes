import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Stripe from 'stripe';
import { v2 as cloudinary } from 'cloudinary';

export interface ServiceStatus {
  status: 'connected' | 'disconnected' | 'error' | 'not_configured';
  message?: string;
  latency?: number;
}

export interface DatabaseStatus extends ServiceStatus {
  type: 'postgres';
}

export interface StripeStatus extends ServiceStatus {
  mode?: 'test' | 'live';
  webhookConfigured?: boolean;
  apiKeyConfigured?: boolean;
}

export interface RevenueCatStatus extends ServiceStatus {
  // RevenueCat has no live/sandbox split at the server level: a single
  // project receives webhooks for both, tagged per-event with environment.
  webhookConfigured?: boolean;
  apiKeyConfigured?: boolean;
  iosApiKeyConfigured?: boolean;
  androidApiKeyConfigured?: boolean;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: DatabaseStatus;
    stripe: StripeStatus;
    revenuecat: RevenueCatStatus;
    cloudinary: ServiceStatus;
  };
}

@Injectable()
export class HealthService {
  private stripe: Stripe | null = null;

  constructor(private dataSource: DataSource) {
    // Initialize Stripe if key is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey && !stripeKey.includes('placeholder')) {
      this.stripe = new Stripe(stripeKey);
    }

    // Initialize Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async checkHealth(): Promise<HealthCheckResponse> {
    const [database, stripe, revenuecat, cloudinaryStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkStripe(),
      this.checkRevenueCat(),
      this.checkCloudinary(),
    ]);

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (database.status === 'error' || database.status === 'disconnected') {
      overallStatus = 'unhealthy';
    } else if (
      stripe.status === 'error' ||
      revenuecat.status === 'error' ||
      cloudinaryStatus.status === 'error'
    ) {
      overallStatus = 'degraded';
    } else if (
      stripe.status === 'not_configured' ||
      revenuecat.status === 'not_configured' ||
      cloudinaryStatus.status === 'not_configured'
    ) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database,
        stripe,
        revenuecat,
        cloudinary: cloudinaryStatus,
      },
    };
  }

  private checkRevenueCat(): RevenueCatStatus {
    // RevenueCat webhook auth uses a bearer secret stored server-side.
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    // Client public API keys are kept on the mobile side, but we let the API
    // expose flags so the admin can confirm the project is wired up.
    const iosKey = process.env.REVENUECAT_IOS_API_KEY;
    const androidKey = process.env.REVENUECAT_ANDROID_API_KEY;

    const webhookConfigured =
      !!webhookSecret && !webhookSecret.includes('placeholder');
    const iosApiKeyConfigured = !!iosKey && !iosKey.includes('placeholder');
    const androidApiKeyConfigured =
      !!androidKey && !androidKey.includes('placeholder');
    const apiKeyConfigured = iosApiKeyConfigured || androidApiKeyConfigured;

    if (!webhookConfigured && !apiKeyConfigured) {
      return {
        status: 'not_configured',
        message: 'RevenueCat is not configured',
        webhookConfigured,
        apiKeyConfigured,
        iosApiKeyConfigured,
        androidApiKeyConfigured,
      };
    }

    return {
      status: 'connected',
      message: 'RevenueCat webhook configured',
      webhookConfigured,
      apiKeyConfigured,
      iosApiKeyConfigured,
      androidApiKeyConfigured,
    };
  }

  private async checkDatabase(): Promise<DatabaseStatus> {
    const startTime = Date.now();

    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'connected',
        message: 'PostgreSQL (Supabase) connection successful',
        latency: Date.now() - startTime,
        type: 'postgres',
      };
    } catch (error) {
      return {
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Database connection failed',
        latency: Date.now() - startTime,
        type: 'postgres',
      };
    }
  }

  private async checkStripe(): Promise<StripeStatus> {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Check if Stripe is configured
    if (!stripeKey || stripeKey.includes('placeholder')) {
      return {
        status: 'not_configured',
        message: 'Stripe API key not configured',
        apiKeyConfigured: false,
        webhookConfigured:
          !!webhookSecret && !webhookSecret.includes('placeholder'),
      };
    }

    // Determine mode from key
    const mode: 'test' | 'live' = stripeKey.startsWith('sk_live_')
      ? 'live'
      : 'test';

    const startTime = Date.now();
    try {
      // Test the connection by fetching balance (simple API call)
      await this.stripe!.balance.retrieve();

      return {
        status: 'connected',
        message: 'Stripe connection successful',
        latency: Date.now() - startTime,
        mode,
        apiKeyConfigured: true,
        webhookConfigured:
          !!webhookSecret && !webhookSecret.includes('placeholder'),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Stripe.errors.StripeAuthenticationError
          ? 'Invalid API key'
          : error instanceof Error
            ? error.message
            : 'Stripe connection failed';

      return {
        status: 'error',
        message: errorMessage,
        latency: Date.now() - startTime,
        mode,
        apiKeyConfigured: true,
        webhookConfigured:
          !!webhookSecret && !webhookSecret.includes('placeholder'),
      };
    }
  }

  private async checkCloudinary(): Promise<ServiceStatus> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return {
        status: 'not_configured',
        message: 'Cloudinary credentials not configured',
      };
    }

    const startTime = Date.now();
    try {
      const result = await cloudinary.api.ping();

      if (result.status === 'ok') {
        return {
          status: 'connected',
          message: 'Cloudinary connection successful',
          latency: Date.now() - startTime,
        };
      }

      return {
        status: 'error',
        message: 'Cloudinary ping failed',
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Cloudinary connection failed',
        latency: Date.now() - startTime,
      };
    }
  }

  async getStats() {
    try {
      const [users, topics, quotes] = await Promise.all([
        this.dataSource.query('SELECT COUNT(*) as count FROM "user"'),
        this.dataSource.query('SELECT COUNT(*) as count FROM topic'),
        this.dataSource.query('SELECT COUNT(*) as count FROM quote'),
      ]);

      return {
        users: parseInt(users[0]?.count || '0'),
        topics: parseInt(topics[0]?.count || '0'),
        quotes: parseInt(quotes[0]?.count || '0'),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        users: 0,
        topics: 0,
        quotes: 0,
        error: 'Failed to fetch stats',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
