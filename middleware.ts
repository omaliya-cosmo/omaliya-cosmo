import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/sessions";
import { decryptAdminSession } from "@/app/lib/adminSession";

// Define protected and public routes
const protectedUserRoutes = [""];
const publicUserRoutes = ["/login", "/register"];

const protectedAdminRoutes = [, "/admin/profile"];
const publicAdminRoutes = ["/admin/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const response = NextResponse.next();
  const cookieStore = await cookies();

  // Retrieve session cookies
  const sessionCookie = cookieStore.get("session")?.value;
  const adminCookie = cookieStore.get("admin_session")?.value;

  // Decrypt user session
  const session = sessionCookie ? await decrypt(sessionCookie) : null;
  const user = session?.customerId;

  // Decrypt admin session
  const adminSession = adminCookie
    ? await decryptAdminSession(adminCookie)
    : null;
  const admin = adminSession?.adminId;

  // Check for existing country cookie
  let country = cookieStore.get("user_country")?.value;

  if (!country) {
    try {
      const geoResponse = await fetch("http://ip-api.com/json");
      const data = await geoResponse.json();
      country = data.countryCode || "US";
    } catch (error) {
      country = "US"; // Default fallback
    }

    response.cookies.set("user_country", country || "US", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // User Authentication Logic
  if (protectedUserRoutes.includes(path) && !user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (publicUserRoutes.includes(path) && user) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Admin Authentication Logic
  if (protectedAdminRoutes.includes(path) && !admin) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }
  if (publicAdminRoutes.includes(path) && admin) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  // Profile route testing logic
  if (path.startsWith("/profile")) {
    const isAuthenticated = checkAuthStatus(req);
    if (!isAuthenticated) {
      console.warn(
        "Profile accessed without authentication - would normally redirect"
      );
    }
  }

  return response;
}

// Helper function to check auth status (implement your actual auth check)
function checkAuthStatus(request: NextRequest) {
  // For testing, return true to allow access
  return true;

  // Later implement your actual auth check:
  // const token = request.cookies.get('token')?.value;
  // return !!token;
}

// Config to match all routes except static files and API routes
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/profile/:path*", // Add this line if not already present
  ],
};
