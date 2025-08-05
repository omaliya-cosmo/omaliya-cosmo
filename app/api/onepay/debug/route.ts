import { NextResponse } from "next/server";

export async function GET() {
  // Only include the first 3 and last 3 characters of sensitive values
  // for debugging purposes, never expose full values
  const safelyMaskValue = (value: string | undefined): string => {
    if (!value) return "missing";
    if (value.length <= 6) return "***";
    return `${value.substring(0, 3)}...${value.substring(value.length - 3)}`;
  };

  return NextResponse.json({
    status: "Debug info for OnePay integration",
    environment: {
      APP_ID_present: !!process.env.ONEPAY_APP_ID,
      APP_ID_length: process.env.ONEPAY_APP_ID?.length || 0,
      APP_ID_sample: safelyMaskValue(process.env.ONEPAY_APP_ID),

      APP_TOKEN_present: !!process.env.ONEPAY_APP_TOKEN,
      APP_TOKEN_length: process.env.ONEPAY_APP_TOKEN?.length || 0,
      APP_TOKEN_sample: safelyMaskValue(process.env.ONEPAY_APP_TOKEN),

      HASH_SALT_present: !!process.env.ONEPAY_HASH_SALT,
      HASH_SALT_length: process.env.ONEPAY_HASH_SALT?.length || 0,
      HASH_SALT_sample: safelyMaskValue(process.env.ONEPAY_HASH_SALT),

      CALLBACK_TOKEN_present: !!process.env.ONEPAY_CALLBACK_TOKEN,
      CALLBACK_TOKEN_length: process.env.ONEPAY_CALLBACK_TOKEN?.length || 0,
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}
