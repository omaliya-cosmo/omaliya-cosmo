# OnePay Integration Guide

This document explains how the OnePay payment gateway has been integrated into the Omaliya Cosmetics website.

## Changes Made

### 1. Database Schema Updates

- Updated `PaymentMethod` enum in `prisma/schema.prisma` to replace `PAY_HERE` with `ONEPAY`
- Added `paymentTransactionId` field to the `Order` model to store OnePay transaction IDs

### 2. Frontend Integration

- Added OnePay script (`https://storage.googleapis.com/onepayjs/onepayv2.js`) to the main layout
- Created TypeScript types for OnePay in `app/types/onepay.d.ts`
- Updated checkout page (`app/checkout/page.tsx`) with:
  - OnePay payment method radio button
  - OnePay payment flow handling
  - Event listeners for payment success/failure
  - Payment processing states

### 3. Backend Updates

- Updated API routes in `app/api/checkout/route.ts` to handle OnePay payments
- Added support for storing OnePay transaction IDs in orders

## Environment Variables Required

Create a `.env.local` file with the following OnePay credentials:

```env
NEXT_PUBLIC_ONEPAY_APP_ID=your_app_id_here
NEXT_PUBLIC_ONEPAY_HASH_TOKEN=your_hash_token_here
NEXT_PUBLIC_ONEPAY_APP_TOKEN=your_app_token_here
```

## How OnePay Integration Works

### Payment Flow

1. User selects OnePay as payment method
2. User fills out checkout form and clicks "Pay with OnePay"
3. Form validation occurs
4. OnePay payment popup/iframe opens
5. User completes payment on OnePay interface
6. OnePay returns success/failure event
7. On success: Order is created automatically with transaction ID
8. On failure: User is shown error message and can retry

### Code Structure

- **OnePay Event Listeners**: Handle `onePaySuccess` and `onePayFail` events
- **Payment Initiation**: `initiateOnePayPayment()` function sets up OnePay data and triggers payment
- **Order Processing**: `processOrderAfterPayment()` creates order after successful payment
- **State Management**: Tracks payment processing state separately from order processing

## OnePay Configuration

The OnePay integration requires the following data to be sent:

- `currency`: "LKR" or "USD"
- `amount`: Total order amount
- `appid`: Your OnePay App ID
- `hashToken`: Your OnePay Hash Token
- `apptoken`: Your OnePay App Token
- `orderReference`: Unique order reference (format: OM-{timestamp})
- `customerFirstName`: Customer's first name
- `customerLastName`: Customer's last name
- `customerPhoneNumber`: Customer's phone number
- `customerEmail`: Customer's email
- `transactionRedirectUrl`: Current page URL
- `additionalData`: Order notes (optional)

## Getting OnePay Credentials

1. Sign up for a OnePay merchant account
2. Access your merchant dashboard
3. Obtain your App ID, Hash Token, and App Token
4. Add these to your environment variables

## Testing

To test the OnePay integration:

1. Set up OnePay test credentials in your environment
2. Place a test order selecting OnePay payment method
3. Complete the payment flow
4. Verify order creation with transaction ID storage

## Notes

- OnePay payments are processed immediately, so orders are created only after successful payment
- Transaction IDs are stored in the database for reference and reconciliation
- The integration handles both success and failure scenarios gracefully
- Payment processing states are shown to users for better UX
