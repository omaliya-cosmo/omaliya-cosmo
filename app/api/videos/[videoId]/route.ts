import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  const { videoId } = params;

  try {
    const deletedVideo = await prisma.videos.delete({
      where: { id: videoId },
    });

    return NextResponse.json(deletedVideo, { status: 200 });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
