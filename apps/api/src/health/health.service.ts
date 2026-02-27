import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Stripe from 'stripe';
import { v2 as cloudinary } from 'cloudinary';
import { getDatabaseType, isUsingSupabase } from '../config/database.config';

export interface ServiceStatus {
  status: 'connected' | 'disconnected' | 'error' | 'not_configured';
  message?: string;
  latency?: number;
}

export interface DatabaseStatus extends ServiceStatus {
  type: 'postgres' | 'sqlite';
  provider?: 'supabase' | 'direct' | 'local';
}

export interface StripeStatus extends ServiceStatus {
  mode?: 'test' | 'live';
  webhookConfigured?: boolean;
  apiKeyConfigured?: boolean;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: DatabaseStatus;
    stripe: StripeStatus;
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
    const [database, stripe, cloudinaryStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkStripe(),
      this.checkCloudinary(),
    ]);

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (database.status === 'error' || database.status === 'disconnected') {
      overallStatus = 'unhealthy';
    } else if (
      stripe.status === 'error' ||
      cloudinaryStatus.status === 'error'
    ) {
      overallStatus = 'degraded';
    } else if (
      stripe.status === 'not_configured' ||
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
        cloudinary: cloudinaryStatus,
      },
    };
  }

  private async checkDatabase(): Promise<DatabaseStatus> {
    const startTime = Date.now();
    const dbType = getDatabaseType();
    const usingSupabase = isUsingSupabase();

    // Determine provider
    let provider: 'supabase' | 'direct' | 'local' = 'local';
    if (dbType === 'postgres') {
      provider = usingSupabase ? 'supabase' : 'direct';
    }

    try {
      // Simple query to check connection
      await this.dataSource.query('SELECT 1');
      return {
        status: 'connected',
        message: `${dbType === 'postgres' ? 'PostgreSQL' : 'SQLite'} connection successful`,
        latency: Date.now() - startTime,
        type: dbType,
        provider,
      };
    } catch (error) {
      return {
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Database connection failed',
        latency: Date.now() - startTime,
        type: dbType,
        provider,
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

    // Check if Cloudinary is configured
    if (!cloudName || !apiKey || !apiSecret) {
      return {
        status: 'not_configured',
        message: 'Cloudinary credentials not configured',
      };
    }

    const startTime = Date.now();
    try {
      // Test connection by pinging the API
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
}
