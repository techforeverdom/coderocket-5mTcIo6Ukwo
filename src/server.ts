import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config, validateConfig } from './config/config'

// Validate configuration on startup
try {
  validateConfig()
} catch (error) {
  console.error('❌ Configuration validation failed:', error)
  process.exit(1)
}

const app = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.app.environment,
    version: config.app.version,
    uptime: process.uptime(),
  })
})

// API routes placeholder
app.use('/api', (req, res) => {
  res.json({
    message: 'API endpoint',
    path: req.path,
    method: req.method,
  })
})

// Serve static files in production
if (config.app.environment === 'production') {
  app.use(express.static('dist'))
  
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'dist' })
  })
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err)
  
  res.status(err.status || 500).json({
    error: config.app.environment === 'production' ? 'Internal server error' : err.message,
    ...(config.app.environment !== 'production' && { stack: err.stack }),
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('🚀 Server started successfully!')
  console.log(`📊 Environment: ${config.app.environment}`)
  console.log(`🌐 Server running on port ${PORT}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  
  if (config.app.environment === 'development') {
    console.log(`🎯 API base URL: ${config.api.baseUrl}`)
    console.log(`💳 Payments enabled: ${config.features.enablePayments}`)
    console.log(`📧 Email notifications: ${config.features.enableEmailNotifications}`)
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...')
  process.exit(0)
})

export default app