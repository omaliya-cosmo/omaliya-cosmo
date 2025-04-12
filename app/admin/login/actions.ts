"use server";

import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { createAdminSession, deleteAdminSession } from "@/app/lib/adminSession";
import { redirect } from "next/navigation";

// Login Schema
const loginSchema = z.object({
  username: z.string().trim(),
  password: z.string().trim(),
});

/**
 * Handles admin login.
 * Validates the provided form data, checks if the admin exists, and creates a session.
 * Redirects to the admin dashboard upon successful login.
 *
 * @param prevState - The previous state (not used in this implementation).
 * @param formData - The form data containing username and password.
 * @returns An object containing errors if validation or authentication fails.
 */
export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { username, password } = result.data;

  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash ?? ""))) {
    return { errors: { username: ["Invalid username or password"] } };
  }

  await createAdminSession(admin.id);

  redirect("/admin");
}

/**
 * Handles admin logout.
 * Deletes the current session and redirects to the login page.
 */
export async function logout() {
  await deleteAdminSession();
  redirect("/admin/login");
}
