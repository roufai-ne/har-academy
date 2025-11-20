# Payment Service

Payment and subscription management service for HAR Academy, handling Stripe integration for course purchases and recurring subscriptions.

## Features

- **Course Purchases**: One-time payment for individual courses
- **Subscriptions**: Monthly/yearly subscription plans (Basic, Pro, Premium)
- **Stripe Integration**: Payment intents, customer management, webhooks
- **Transaction Tracking**: Complete payment history and status management
- **Refund Support**: Handle refunds through Stripe API

## Tech Stack

- Node.js 18+ with Express
- MongoDB with Mongoose
- Stripe SDK
- JWT authentication
- Winston logging

## API Endpoints

### Payments
- `POST /api/v1/payments/purchase` - Create course purchase
- `GET /api/v1/payments/transactions` - Get user transactions

### Subscriptions
- `POST /api/v1/payments/subscriptions` - Create subscription
- `GET /api/v1/payments/subscription` - Get user subscription
- `POST /api/v1/payments/subscription/cancel` - Cancel subscription

### Webhooks
- `POST /api/v1/payments/webhook` - Stripe webhook handler

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Stripe credentials
```

3. Start service:
```bash
npm run dev  # Development
npm start    # Production
```

## Stripe Setup

1. Create Stripe account and get API keys
2. Create products and prices in Stripe Dashboard
3. Configure webhook endpoint: `/api/v1/payments/webhook`
4. Add webhook secret to environment variables

## Docker

```bash
docker build -t har-payment-service .
docker run -p 3002:3002 --env-file .env har-payment-service
```

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Subscription Plans

| Plan | Monthly | Yearly |
|------|---------|--------|
| Basic | €9.99 | €99.99 |
| Pro | €19.99 | €199.99 |
| Premium | €29.99 | €299.99 |
