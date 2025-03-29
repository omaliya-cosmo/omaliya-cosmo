"use server";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/sessions";
import { decryptAdminSession } from "@/app/lib/adminSession";
import { prisma } from "./lib/prisma";

// Function to get customer data by token
export async function getCustomerFromToken() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;

  if (!cookie) {
    return null;
  }

  const session = await decrypt(cookie);

  if (!session?.customerId) {
    return null;
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
    });

    return customer;
  } catch (error) {
    console.error("Error fetching user from database:", error);
    return null;
  }
}

// Function to get admin data by token
export async function getAdminFromToken() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("admin_session")?.value;

  if (!cookie) {
    return null;
  }

  const session = await decryptAdminSession(cookie);

  if (!session?.adminId) {
    return null;
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
    });
    console.log("Admin data:", admin);

    return admin;
  } catch (error) {
    console.error("Error fetching admin from database:", error);
    return null;
  }
}
