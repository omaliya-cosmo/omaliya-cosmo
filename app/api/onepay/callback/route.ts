import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { headers } from 'next/headers';

const CALLBACK_TOKEN = process.env.ONEPAY_CALLBACK_TOKEN;

export async function POST(request: Request) {
  try {
    // Validate the callback token for security
    const headersList = headers();
    const authToken = headersList.get('authorization');
    
    // Check if the authorization header matches the callback token
    if (!authToken || authToken !== CALLBACK_TOKEN) {
      console.error("OnePay callback: Invalid token");
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Expected callback structure from OnePay
    // {
    //   "transaction_id": "WQBV118E584C83CBA50C6",
    //   "status": 1,
    //   "status_message": "SUCCESS",
    //   "additional_data": "" // This should contain our orderId
    // }
    
    console.log("OnePay callback received:", body);
    
    if (!body || !body.transaction_id || body.status === undefined || !body.additional_data) {
      return NextResponse.json({
        success: false,
        error: "Invalid callback data"
      }, { status: 400 });
    }
    
    const orderId = body.additional_data;
    const transactionId = body.transaction_id;
    const isSuccess = body.status === 1;
    
    // Update the order with payment status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: isSuccess ? "PROCESSING" : "PENDING", // Using valid OrderStatus enum values
        notes: isSuccess 
          ? `Payment successful via OnePay. Transaction ID: ${transactionId}` 
          : `Payment failed via OnePay. Transaction ID: ${transactionId}`
      }
    });
    
    // If payment was successful, send notification to customer if phone number exists
    if (isSuccess) {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { address: true }
        });
        
        if (order?.address?.phoneNumber) {
          const customerPhone = order.address.phoneNumber.startsWith('+') 
            ? order.address.phoneNumber.substring(1) // Remove the + sign
            : order.address.phoneNumber;
            
          const customerMessage = `Thank you for your order! Your payment of ${order.currency} ${order.total} for order #${order.id} has been confirmed. Track your order at ${process.env.NEXT_PUBLIC_APP_URL}/profile`;
          
          const notifyUrl = `https://app.notify.lk/api/v1/send?user_id=${
            process.env.NOTIFY_USER_ID
          }&api_key=${process.env.NOTIFY_API_KEY}&sender_id=${
            process.env.NOTIFY_SENDER_ID
          }&to=${customerPhone}&message=${encodeURIComponent(customerMessage)}`;
          
          await fetch(notifyUrl);
        }
      } catch (notificationError) {
        console.error("Failed to send customer notification:", notificationError);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Callback processed successfully"
    });
  } catch (error) {
    console.error("OnePay callback error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}
