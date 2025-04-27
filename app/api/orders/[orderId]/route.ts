import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import nodemailer from "nodemailer";

function normalizePhoneNumber(phone: string) {
  phone = phone.replace(/\D/g, "");
  if (phone.startsWith("0")) {
    return "94" + phone.slice(1);
  }
  if (phone.startsWith("94")) {
    return phone;
  }
  if (phone.length === 9 && phone.startsWith("7")) {
    return "94" + phone;
  }
  return phone;
}

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            product: true,
            bundle: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();

    if (!Object.keys(body).length) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    // Handle tracking notification if trackingNumber and contactMethod are provided
    if (body.trackingNumber && body.contactMethod) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true, address: true },
      });

      if (order && order.address) {
        if (body.contactMethod === "email" && order.address.email) {
          // Send email notification
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: `"Omaliya Cosmetics" <${process.env.EMAIL_USER}>`,
            to: order.address.email,
            subject:
              "Your Omaliya Order Has Been Shipped - Tracking Information",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #333;">Your Order Has Been Shipped</h2>
              </div>
              <p>Dear ${order.address?.firstName || "Customer"},</p>
              <p>Great news! Your order has been shipped and is on its way to you.</p>
              <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Tracking Number:</strong> ${body.trackingNumber}</p>
              </div>
              <p>You can use this tracking number to follow your delivery status.</p>
              <p style="margin-top: 30px;">Thank you for shopping with Omaliya Cosmetics!</p>
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
                <p>If you have any questions, please contact our customer service.</p>
              </div>
              </div>
            `,
          });
        } else if (
          body.contactMethod === "phone" &&
          order.address.phoneNumber
        ) {
          // Send SMS notification
          const message = `Dear ${
            order.address?.firstName || "Customer"
          }, thank you for shopping with Omaliya Cosmetics. Your order #${orderId} has been shipped and is on its way. Track your delivery using: ${
            body.trackingNumber
          }`;
          const notifyUrl = `https://app.notify.lk/api/v1/send?user_id=${
            process.env.NOTIFY_USER_ID
          }&api_key=${process.env.NOTIFY_API_KEY}&sender_id=${
            process.env.NOTIFY_SENDER_ID
          }&to=${normalizePhoneNumber(
            order.address.phoneNumber
          )}&message=${encodeURIComponent(message)}`;

          await fetch(notifyUrl);
        }
      }
    }

    const { contactMethod, ...cleanedBody } = body;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: cleanedBody, // Dynamically update fields based on the request body
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    await prisma.orderItem.deleteMany({
      where: { orderId: orderId },
    });

    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
