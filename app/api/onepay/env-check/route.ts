import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    // Get all OnePay related environment variables
    const APP_ID = process.env.ONEPAY_APP_ID;
    const APP_TOKEN = process.env.ONEPAY_APP_TOKEN;
    const HASH_SALT = process.env.ONEPAY_HASH_SALT;
    const CALLBACK_TOKEN = process.env.ONEPAY_CALLBACK_TOKEN;

    // Mask function to safely show parts of sensitive data
    const maskValue = (value: string | undefined): string => {
      if (!value) return "Not set";
      if (value.length <= 8) return "***" + value.substring(value.length - 2);
      return value.substring(0, 4) + "..." + value.substring(value.length - 4);
    };

    // Check for whitespace in credentials
    const containsWhitespace = (str: string | undefined): boolean => {
      if (!str) return false;
      return /\s/.test(str);
    };

    // Calculate a sample hash to verify the hash calculation is working
    const sampleInput = "test123";
    const sampleHash = crypto
      .createHash("sha256")
      .update(sampleInput)
      .digest("hex");

    // Prepare response
    const envInfo = {
      APP_ID: {
        present: !!APP_ID,
        length: APP_ID?.length || 0,
        masked: maskValue(APP_ID),
        hasWhitespace: containsWhitespace(APP_ID),
        trimmedLength: APP_ID?.trim().length || 0,
      },
      APP_TOKEN: {
        present: !!APP_TOKEN,
        length: APP_TOKEN?.length || 0,
        masked: maskValue(APP_TOKEN),
        hasWhitespace: containsWhitespace(APP_TOKEN),
        trimmedLength: APP_TOKEN?.trim().length || 0,
      },
      HASH_SALT: {
        present: !!HASH_SALT,
        length: HASH_SALT?.length || 0,
        masked: maskValue(HASH_SALT),
        hasWhitespace: containsWhitespace(HASH_SALT),
        trimmedLength: HASH_SALT?.trim().length || 0,
      },
      CALLBACK_TOKEN: {
        present: !!CALLBACK_TOKEN,
        length: CALLBACK_TOKEN?.length || 0,
        masked: maskValue(CALLBACK_TOKEN),
        hasWhitespace: containsWhitespace(CALLBACK_TOKEN),
        trimmedLength: CALLBACK_TOKEN?.trim().length || 0,
      },
    };

    // Test hash generation to ensure crypto is working correctly
    const hashTest = {
      input: sampleInput,
      output: sampleHash,
      explanation: "SHA-256 hash of 'test123'",
    };

    // Create sample authorization headers to help debug
    const headers = {
      plainToken: APP_TOKEN || "",
      bearerToken: `Bearer ${APP_TOKEN || ""}`,
      basicAuth: `Basic ${Buffer.from(
        `${APP_ID || ""}:${APP_TOKEN || ""}`
      ).toString("base64")}`,
    };

    return NextResponse.json({
      success: true,
      environment: envInfo,
      hashTest,
      sampleHeaders: headers,
      nodeVersion: process.version,
    });
  } catch (error) {
    console.error("Environment check error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check environment variables",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
