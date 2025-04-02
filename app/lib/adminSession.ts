import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Validate admin session secret key at startup
const adminSecretKey = process.env.ADMIN_SESSION_SECRET;
if (!adminSecretKey) {
  throw new Error(
    "ADMIN_SESSION_SECRET is not defined in environment variables"
  );
}
const encodedAdminKey = new TextEncoder().encode(adminSecretKey);

type AdminSessionPayload = {
  adminId: string;
  expiresAt: Date;
};

// Encrypts the admin session payload into a JWT token
export async function encryptAdminSession(payload: AdminSessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedAdminKey);
}

// Decrypts and verifies the JWT token to extract the session payload
export async function decryptAdminSession(
  session: string | undefined
): Promise<AdminSessionPayload | null> {
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, encodedAdminKey, {
      algorithms: ["HS256"],
    });
    return payload as AdminSessionPayload;
  } catch (error: any) {
    console.error("Failed to verify admin session:", error.message);
    return null;
  }
}

// Creates a new session for the given admin ID and sets it as a cookie
export async function createAdminSession(adminId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encryptAdminSession({ adminId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("admin_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "strict",
    path: "/",
  });
}

// Deletes the admin session cookie
export async function deleteAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

// Retrieves and decrypts the admin session from the cookie store
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return session ? decryptAdminSession(session) : null;
}
