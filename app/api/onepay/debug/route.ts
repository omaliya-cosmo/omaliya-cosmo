import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  console.log("🐛 Debug callback GET request received");
  console.log("Parameters:", Object.fromEntries(searchParams.entries()));
  console.log("Full URL:", request.url);
  console.log("Headers:", Object.fromEntries(request.headers.entries()));

  return NextResponse.json({
    message: "Debug callback - check server logs",
    parameters: Object.fromEntries(searchParams.entries()),
    url: request.url,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  console.log("🐛 Debug callback POST request received");

  try {
    const body = await request.json();
    console.log("POST Body:", JSON.stringify(body, null, 2));

    return NextResponse.json({
      message: "Debug callback POST - check server logs",
      body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log("POST Error:", error);
    return NextResponse.json({
      message: "Debug callback POST error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
