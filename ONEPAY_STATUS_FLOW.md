# OnePay Order Status Flow - Implementation Summary

## New Order Status: PENDING_PAYMENT

### Schema Changes Made:

```prisma
enum OrderStatus {
  PENDING
  PENDING_PAYMENT  // NEW: For OnePay orders before payment
  PROCESSING
  SHIPPED
  CANCELED
  DELIVERED
}
```

## Order Status Flow for OnePay

### 1. **Order Creation (Checkout)**

- **Status**: `PENDING_PAYMENT`
- **When**: User clicks "Pay with OnePay" in checkout
- **Action**: Order created in database before redirect to OnePay
- **Purpose**: Tracks that payment is pending

### 2. **Payment Processing**

- **Status**: `PENDING_PAYMENT` (unchanged)
- **When**: User is on OnePay payment gateway
- **Action**: User completes payment on OnePay website
- **Purpose**: Order exists but payment not yet confirmed

### 3. **Payment Success (Callback)**

- **Status**: `PENDING_PAYMENT` → `PENDING`
- **When**: OnePay calls back with success
- **Action**: Order status updated via `/api/onepay/callback`
- **Purpose**: Payment confirmed, order ready for processing

### 4. **Admin Processing**

- **Status**: `PENDING` → `PROCESSING`
- **When**: Admin starts preparing the order
- **Action**: Manual status update by admin
- **Purpose**: Order being prepared for shipment

## Files Modified:

### 1. **Prisma Schema** (`prisma/schema.prisma`)

```prisma
// Added new status
enum OrderStatus {
  PENDING
  PENDING_PAYMENT  // NEW
  PROCESSING
  SHIPPED
  CANCELED
  DELIVERED
}
```

### 2. **Checkout Page** (`app/checkout/page.tsx`)

```typescript
// Sets initial status for OnePay orders
status: "PENDING_PAYMENT";
```

### 3. **OnePay Callback** (`app/api/onepay/callback/route.ts`)

```typescript
// Updates status after successful payment
status: "PENDING"; // Changed from PROCESSING to PENDING
```

### 4. **Order Creation API** (`app/api/orders/route.ts`)

```typescript
// Now accepts status parameter
status: body.status || "PENDING";
```

### 5. **Order Confirmation Page** (`app/order-confirmation/page.tsx`)

```typescript
// Enhanced status display with colors and messages
{orderDetails?.status === 'PENDING_PAYMENT' ? 'Pending Payment' : ...}
```

## Status Display Colors:

- **PENDING_PAYMENT**: 🟡 Yellow - "Pending Payment"
- **PENDING**: 🔵 Blue - "Payment Received - Processing"
- **PROCESSING**: 🟣 Purple - "Processing"
- **SHIPPED**: 🟦 Indigo - "Shipped"
- **DELIVERED**: 🟢 Green - "Delivered"

## Complete OnePay Flow:

```
1. User fills checkout form
2. Clicks "Pay with OnePay"
3. Order created with status: PENDING_PAYMENT
4. User redirected to OnePay
5. User completes payment
6. OnePay calls back to /api/onepay/callback
7. Order status updated to: PENDING
8. User redirected to success page
9. Admin can see order is ready for processing
```

## Benefits:

1. **Clear Status Tracking**: Admins can see which orders are waiting for payment vs ready to process
2. **Better UX**: Users see appropriate messages based on payment status
3. **Audit Trail**: Complete history of order payment status
4. **Admin Filtering**: Can filter orders by PENDING_PAYMENT to see unpaid orders
5. **Error Recovery**: Failed payments stay in PENDING_PAYMENT status for retry

## Next Steps:

1. **Run Prisma Generate**: `npx prisma generate` to update types
2. **Test Flow**: Test complete OnePay payment flow
3. **Admin Interface**: Update admin to handle PENDING_PAYMENT status
4. **Monitoring**: Monitor for orders stuck in PENDING_PAYMENT status

The implementation provides a clear distinction between orders waiting for payment and orders with confirmed payments ready for processing!
