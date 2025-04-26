"use server";

import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { createSession, deleteSession } from "../lib/sessions";
import { redirect } from "next/navigation";

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
