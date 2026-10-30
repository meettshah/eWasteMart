import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // Fetch last 50 notifications for the user
  const rawNotifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const notifications = rawNotifications.map((n) => ({ ...n, _id: n.id }));
  return NextResponse.json(notifications);
}

// Mark all as read, or mark specific one as read
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  
  const body = await req.json().catch(() => ({}));

  if (body.notificationId) {
    await prisma.notification.updateMany({
      where: { id: body.notificationId, userId: session.user.id },
      data: { read: true }
    });
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true }
    });
  }

  return NextResponse.json({ success: true });
}
