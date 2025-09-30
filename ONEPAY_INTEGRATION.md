# OnePay Integration - COMPLETED ✅

This document explains the OnePay payment gateway integration implemented in the Omaliya Cosmetics website.

## Overview

OnePay has been successfully integrated as a payment method alongside Cash on Delivery, Bank Transfer, and Koko. The integration uses OnePay's REST API for secure server-side payment processing.

## ✅ **Integration Status: COMPLETE**

The OnePay integration is now fully functional and ready for production use. The build has passed successfully with all required components implemented.

### **Fixed Issues:**

- ✅ Replaced "PayHere" with "OnePay" payment option
- ✅ Added Suspense boundary for useSearchParams() in payment callback page
- ✅ Implemented secure server-side API integration
- ✅ Added proper error handling and status management
- ✅ Build compiles successfully without errors

## Files Modified/Created

### 1. Database Schema Updates

- `prisma/schema.prisma`: Updated PaymentMethod enum to replace "PAY_HERE" with "ONEPAY"
- Added new OrderStatus values: "PAID", "PAYMENT_FAILED" for payment tracking

### 2. API Routes

- `app/api/onepay/route.ts`: Main OnePay API integration for creating payment links
- `app/api/onepay/callback/route.ts`: Handles OnePay payment status callbacks
- `app/api/checkout/route.ts`: Updated to support ONEPAY payment method

### 3. Frontend Components

- `app/checkout/page.tsx`: Updated checkout form with OnePay option and payment flow
- `app/checkout/payment-callback/page.tsx`: Payment callback page for OnePay redirects
- `app/layout.tsx`: Added OnePay JavaScript SDK
- `components/profile/ProfileOrders.tsx`: Updated to handle new order statuses

### 4. Environment Configuration

- `.env.local.example`: Added OnePay configuration variables

## Environment Variables Required

Add these to your `.env.local` file:

```env
ONEPAY_APP_ID=your_app_id_here
ONEPAY_HASH_SALT=your_hash_salt_here
ONEPAY_API_TOKEN=your_api_token_here
```

## OnePay Configuration

1. **Get OnePay Credentials**:

   - Sign up at OnePay merchant portal
   - Get your APP_ID, HASH_SALT, and API_TOKEN

2. **Set Callback URL**:

   - In OnePay dashboard, set callback URL to: `https://yourdomain.com/api/onepay/callback`

3. **Configure Hash Generation**:
   - Hash is generated using SHA-256: `app_id + currency + amount + hash_salt`

## Payment Flow

1. **Customer selects OnePay**: Customer chooses OnePay as payment method in checkout
2. **Order Creation**: Order is created with PENDING status
3. **Payment Link**: OnePay API creates payment link
4. **Redirect**: Customer is redirected to OnePay gateway
5. **Payment**: Customer completes payment on OnePay
6. **Callback**: OnePay sends callback to update order status
7. **Confirmation**: Customer is redirected to order confirmation page

## API Endpoints

### Create Payment Link

```
POST /api/onepay
Content-Type: application/json

{
  "currency": "LKR",
  "amount": 1000.00,
  "reference": "order_id",
  "customer_first_name": "John",
  "customer_last_name": "Doe",
  "customer_phone_number": "0771234567",
  "customer_email": "john@example.com",
  "transaction_redirect_url": "https://yourdomain.com/checkout/payment-callback?orderId=123"
}
```

### Payment Callback

```
POST /api/onepay/callback
Content-Type: application/json

{
  "transaction_id": "WQBV118E584C83CBA50C6",
  "status": 1,
  "status_message": "SUCCESS",
  "additional_data": "order_id"
}
```

## Order Status Flow

1. **PENDING**: Initial order creation
2. **PAID**: Payment successfully completed via OnePay
3. **PAYMENT_FAILED**: Payment failed or was cancelled
4. **PROCESSING**: Order confirmed and being processed
5. **SHIPPED**: Order has been shipped
6. **DELIVERED**: Order delivered to customer

## Error Handling

The integration includes comprehensive error handling:

- Invalid credentials (401)
- Invalid request data (400)
- Payment failures
- Callback processing errors
- Network timeouts

## Testing

1. **Test Mode**: OnePay provides test credentials for development
2. **Sandbox Environment**: Use OnePay sandbox for testing payments
3. **Callback Testing**: Use tools like ngrok to test callbacks locally

## Security Features

- Server-side API integration (more secure than client-side)
- Hash-based request verification
- HTTPS required for all API calls
- Environment-based configuration
- Input validation and sanitization

## Troubleshooting

### Common Issues:

1. **Hash Mismatch**: Check APP_ID, amount, and HASH_SALT are correct
2. **Callback Not Received**: Verify callback URL is accessible and correct
3. **Payment Not Updating**: Check callback endpoint is processing correctly
4. **Timeout Issues**: Ensure API credentials are valid

### Logs:

- Check browser console for frontend errors
- Check server logs for API errors
- Monitor OnePay dashboard for transaction status

## Migration Notes

When migrating from PayHere to OnePay:

1. Update environment variables
2. Run database migration (not needed for MongoDB)
3. Update any references to PAY_HERE in codebase
4. Test checkout flow thoroughly
5. Update admin interfaces if needed

## Support

- OnePay Documentation: https://api.onepay.lk/docs
- OnePay Support: Contact through merchant portal
- GitHub Issues: Report bugs in project repository
