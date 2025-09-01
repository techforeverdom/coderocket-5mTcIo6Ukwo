# BFG Fundraising API

A comprehensive fundraising platform API with Stripe integration for student athlete fundraising campaigns.

## Features

- 🏦 **Stripe Integration** - Complete payment processing with webhooks
- 💰 **Configurable Fees** - Platform fees (6-10%) with transparent calculation
- 🔐 **Secure Webhooks** - Signature verification and event logging
- 📊 **PostgreSQL Database** - Robust schema with proper relationships
- 🧪 **Comprehensive Testing** - Unit and integration tests
- 🔒 **Security** - JWT authentication, input validation, CORS
- 📝 **TypeScript** - Full type safety throughout the application

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Stripe account

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up database:**
```bash
# Run the PostgreSQL schema from the previous artifact
psql -d your_database < schema.sql
```

4. **Build and start:**
```bash
npm run build
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Donations
- `POST /api/donations/checkout` - Create payment intent
- `POST /api/donations/confirm` - Confirm payment
- `GET /api/donations/:id` - Get donation details
- `POST /api/donations/:id/refund` - Create refund

### Webhooks
- `POST /webhooks/stripe` - Handle Stripe webhooks

### Health Check
- `GET /health` - API health status

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bfg_fundraising

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Platform
PLATFORM_FEE_PERCENTAGE=8.0

# JWT
JWT_SECRET=your_jwt_secret
```

## Fee Structure

- **Platform Fee**: 6-10% (configurable)
- **Stripe Fee**: 2.9% + $0.30
- **Net Amount**: Donation - Platform Fee - Stripe Fee

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Set production environment variables**

3. **Start the server:**
```bash
npm start
```

## Architecture

```
src/
├── config/          # Configuration files
├── controllers/     # Route handlers
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── services/        # Business logic
├── __tests__/       # Test files
└── server.ts        # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details