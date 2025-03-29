import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/sessions";
import { prisma } from "./lib/prisma";

// Function to get user data by token
export async function getUserFromToken() {
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
