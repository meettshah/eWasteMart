import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import { Notification } from "@/models/Notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await mongooseConnect();

  // Fetch last 50 notifications for the user
  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(notifications);
}

// Mark all as read, or mark specific one as read
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await mongooseConnect();
  
  const body = await req.json().catch(() => ({}));

  if (body.notificationId) {
    await Notification.updateOne(
      { _id: body.notificationId, userId: session.user.id },
      { $set: { read: true } }
    );
  } else {
    // Mark all as read
    await Notification.updateMany(
      { userId: session.user.id, read: false },
      { $set: { read: true } }
    );
  }

  return NextResponse.json({ success: true });
}
