import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Validate secret key at startup
const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET is not defined in environment variables");
}
const encodedKey = new TextEncoder().encode(secretKey);

type SessionPayload = {
  customerId: string;
  expiresAt: Date;
};

// Encrypts the session payload into a JWT token
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

// Decrypts and verifies the JWT token to extract the session payload
export async function decrypt(
  session: string | undefined
): Promise<SessionPayload | null> {
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error: any) {
    console.error("Failed to verify session:", error.message);
    return null;
  }
}

// Creates a new session for the given customer ID and sets it as a cookie
export async function createSession(customerId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ customerId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "strict",
    path: "/",
  });
}

// Deletes the session cookie
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// Retrieves and decrypts the session from the cookie store
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  return session ? decrypt(session) : null;
}
