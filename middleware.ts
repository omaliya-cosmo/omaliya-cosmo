import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/app/actions";

const protectedRoutes = [""];
const publicRoutes = ["/login", "/signup"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // Get customer session from the token and fetch customer details from DB
  const customer = await getUserFromToken();

  // Redirect if the customer is not authorized for a protected route
  if (isProtectedRoute && !customer) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect if the customer is logged in but tries to access a public route
  if (isPublicRoute && customer) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}
