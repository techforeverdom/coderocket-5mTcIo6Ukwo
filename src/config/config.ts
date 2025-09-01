export const config = {
  // App Configuration
  app: {
    name: 'Believe Fundraising',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    url: process.env.VITE_APP_URL || 'http://localhost:5173'
  },

  // API Configuration
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || '/api',
    timeout: 30000
  },

  // Database Configuration (for future use)
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./dev.db'
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    jwtExpiresIn: '7d',
    bcryptRounds: 12
  },

  // Email Configuration (optional for development)
  email: {
    provider: process.env.EMAIL_PROVIDER || 'console', // 'console' for development
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },

  // Payment Configuration (optional for development)
  stripe: {
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_development_key',
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_development_key',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_development_key',
    enabled: !!process.env.STRIPE_SECRET_KEY // Only enable if key is provided
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  // Feature Flags
  features: {
    enablePayments: process.env.ENABLE_PAYMENTS === 'true' || false,
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' || false,
    enableSocialLogin: process.env.ENABLE_SOCIAL_LOGIN === 'true' || false,
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true' || false
  },

  // Security Configuration
  security: {
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 100,
    sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
}

// Validation function for production environment
export function validateConfig() {
  const errors: string[] = []

  if (config.app.environment === 'production') {
    if (config.auth.jwtSecret === 'dev-secret-key-change-in-production') {
      errors.push('JWT_SECRET must be set in production')
    }

    if (config.security.sessionSecret === 'dev-session-secret-change-in-production') {
      errors.push('SESSION_SECRET must be set in production')
    }

    if (config.features.enablePayments && !process.env.STRIPE_SECRET_KEY) {
      errors.push('STRIPE_SECRET_KEY is required when payments are enabled in production')
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
  }
}

// Helper functions
export function isProduction() {
  return config.app.environment === 'production'
}

export function isDevelopment() {
  return config.app.environment === 'development'
}

export function isPaymentsEnabled() {
  return config.features.enablePayments && config.stripe.enabled
}

export default config