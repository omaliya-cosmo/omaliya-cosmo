import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/sessions";
import { decryptAdminSession } from "@/app/lib/adminSession";

const protectedUserRoutes = ["/profile"];
const publicUserRoutes = ["/login", "/register"];
const publicAdminRoutes = ["/admin/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const response = NextResponse.next();
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  const adminCookie = cookieStore.get("admin_session")?.value;

  const session = sessionCookie ? await decrypt(sessionCookie) : null;
  const user = session?.customerId;

  const adminSession = adminCookie
    ? await decryptAdminSession(adminCookie)
    : null;
  const admin = adminSession?.adminId;

  let country = cookieStore.get("user_country")?.value;

  if (!country) {
    country = (req as any).geo?.country || "LK";

    response.cookies.set("user_country", country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // User route protection
  if (protectedUserRoutes.includes(path) && !user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (publicUserRoutes.includes(path) && user) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Admin route protection
  if (
    path.startsWith("/admin/") &&
    !publicAdminRoutes.includes(path) &&
    !admin
  ) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }
  if (path === "/admin" && !admin) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }
  if (publicAdminRoutes.includes(path) && admin) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
