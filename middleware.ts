import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/sessions";
import { decryptAdminSession } from "./app/lib/adminSession";

// Define protected and public routes for both users and admins
const protectedUserRoutes = ["/profile"];
const publicUserRoutes = ["/login", "/register"];

const protectedAdminRoutes = ["/admin", "/admin/settings"];
const publicAdminRoutes = ["/admin/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if the route is for users or admins
  const isProtectedUserRoute = protectedUserRoutes.includes(path);
  const isPublicUserRoute = publicUserRoutes.includes(path);

  const isProtectedAdminRoute = protectedAdminRoutes.includes(path);
  const isPublicAdminRoute = publicAdminRoutes.includes(path);

  // Get session details
  const cookieStore = await cookies();

  const cookie = cookieStore.get("session")?.value;
  const session = await decrypt(cookie);
  const user = session?.customerId;

  const adminCookie = cookieStore.get("admin_session")?.value;
  const adminsession = await decryptAdminSession(adminCookie);
  const admin = adminsession?.adminId;

  // User Authentication
  if (isProtectedUserRoute && !user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isPublicUserRoute && user) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Admin Authentication
  if (isProtectedAdminRoute && !admin) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }
  if (isPublicAdminRoute && admin) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
}
