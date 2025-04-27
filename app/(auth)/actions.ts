"use server";

import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { createSession, deleteSession } from "../lib/sessions";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import nodemailer from "nodemailer";

// Login Schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z.string().trim(),
});

// Signup Schema
const signupSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }).trim(),
    password: z.string().trim(),
    confirmPassword: z.string().trim(),
    firstName: z.string().min(1, { message: "First name is required" }).trim(),
    lastName: z.string().min(1, { message: "Last name is required" }).trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Password reset request schema
const passwordResetRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
});

// Password reset schema
const passwordResetSchema = z
  .object({
    token: z.string().min(1, { message: "Token is required" }),
    password: z
      .string()
      .min(4, { message: "Password must be at least 4 characters" })
      .trim(),
    confirmPassword: z
      .string()
      .min(4, { message: "Please confirm your password" })
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Handles customer login.
 * Validates the provided form data, checks if the customer exists, and creates a session.
 * Redirects to the dashboard upon successful login.
 *
 * @param prevState - The previous state (not used in this implementation).
 * @param formData - The form data containing email and password.
 * @returns An object containing errors if validation or authentication fails.
 */
export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { email, password } = result.data;

  const customer = await prisma.customer.findUnique({ where: { email } });

  if (
    !customer ||
    !(await bcrypt.compare(password, customer.passwordHash ?? ""))
  ) {
    return { errors: { email: ["Invalid email or password"] } };
  }

  await createSession(customer.id);

  return { success: true };
}

/**
 * Handles customer signup.
 * Validates the provided form data, checks if the customer already exists, and creates a new customer.
 * Creates a session and redirects to the dashboard upon successful signup.
 *
 * @param prevState - The previous state (not used in this implementation).
 * @param formData - The form data containing email, password, confirmPassword, firstName, and lastName.
 * @returns An object containing errors if validation fails or the email is already registered.
 */
export async function signup(prevState: any, formData: FormData) {
  const result = signupSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { email, password, firstName, lastName } = result.data;

  const existingCustomer = await prisma.customer.findUnique({
    where: { email },
  });

  if (existingCustomer) {
    return {
      errors: {
        email: ["Email already exists, please use a different email or login."],
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const customer = await prisma.customer.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      registeredAt: new Date(),
    },
  });

  await createSession(customer.id);

  return { success: true };
}

/**
 * Handles customer logout.
 * Deletes the current session and redirects to the login page.
 */
export async function logout() {
  await deleteSession();
  redirect("/");
}

/**
 * Handles sending a password reset email to the provided email address.
 * Checks if a customer with that email exists and generates a password reset token.
 *
 * @param prevState - The previous state.
 * @param formData - The form data containing the email address.
 * @returns An object indicating success or errors if validation fails.
 */
export async function sendPasswordResetEmail(
  prevState: any,
  formData: FormData
) {
  const result = passwordResetRequestSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { email } = result.data;

  try {
    // Check if the customer exists
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    // Don't reveal if the email exists or not for security
    if (!customer) {
      // Return success even if email is not found, for security reasons
      return { success: true };
    }

    // Generate expiry date (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Get current timestamp in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    // Set expiration time to 24 hours from now (in seconds)
    const expirationTime = currentTime + 24 * 60 * 60;

    // Create a JWT token containing user ID and expire date
    const resetToken = await new SignJWT({
      customerId: customer.id,
      type: "password-reset",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expirationTime)
      .sign(
        new TextEncoder().encode(
          process.env.PASSWORD_RESET_SECRET ||
            process.env.SECRET_KEY ||
            "fallback-secret-key-for-password-reset"
        )
      );

    // Send email with reset link
    const resetLink = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/password-reset/${resetToken}`;

    // Create email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Set up email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Omaliya Cosmetics - Password Reset",
      text: `Hello ${customer.firstName},\n\nPlease use the following link to reset your password: ${resetLink}\n\nThis link will expire in 24 hours.\n\nIf you did not request this password reset, please ignore this email.\n\nRegards,\nOmaliya Cosmetics Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #9333ea; margin-bottom: 5px;">OMALIYA</h1>
            <p style="margin-top: 0; color: #666; font-size: 14px;">PREMIUM COSMETICS</p>
          </div>
          
          <h2>Password Reset Request</h2>
          
          <p>Hello ${customer.firstName},</p>
          
          <p>We received a request to reset your password. Please click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(to right, #9333ea, #ec4899); color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <p><a href="${resetLink}" style="color: #9333ea; word-break: break-all;">${resetLink}</a></p>
          
          <p><strong>This link will expire in 24 hours.</strong></p>
          
          <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
            <p>Omaliya Cosmetics &copy; ${new Date().getFullYear()}</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      errors: {
        email: [
          "There was an error processing your request. Please try again.",
        ],
      },
    };
  }
}

/**
 * Handles resetting a customer's password with a valid token.
 * Validates the token, checks if it's expired, and updates the password.
 *
 * @param prevState - The previous state.
 * @param formData - The form data containing the token and new password.
 * @returns An object indicating success or errors if validation fails or the token is invalid.
 */
export async function resetPassword(prevState: any, formData: FormData) {
  const result = passwordResetSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { token, password } = result.data;

  try {
    // Verify the token
    const secretKey =
      process.env.PASSWORD_RESET_SECRET ||
      process.env.SECRET_KEY ||
      "fallback-secret-key-for-password-reset";
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(secretKey)
    );

    // Get the payload data
    const payload = verified.payload;

    // Check token type
    if (payload.type !== "password-reset") {
      return { error: "Invalid reset token" };
    }

    // Extract customer ID
    const customerId = payload.customerId as string;

    if (!customerId) {
      return { error: "Invalid token data" };
    }

    // Find the customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return { error: "Customer not found" };
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update the customer's password
    await prisma.customer.update({
      where: { id: customerId },
      data: { passwordHash },
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      error:
        error instanceof Error && error.name === "JWTExpired"
          ? "Reset token has expired. Please request a new password reset."
          : "Invalid or expired reset link. Please request a new password reset.",
    };
  }
}
