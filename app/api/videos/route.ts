import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const videos = await prisma.videos.findMany();
    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, videoUrl, thumbnail, platform, likes, views } = body;

    if (!title || !videoUrl || !platform) {
      return NextResponse.json(
        { error: "Title, URL, and platform are required" },
        { status: 400 }
      );
    }

    const newVideo = await prisma.videos.create({
      data: {
        title,
        videoUrl,
        thumbnail: thumbnail || null,
        platform,
        likes: likes || 0,
        views: views || 0,
      },
    });

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
