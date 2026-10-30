import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const TIME_SLOTS = ["09:00–11:00", "11:00–13:00", "14:00–16:00", "16:00–18:00"];

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Please login first." }, { status: 401 });

  const { id } = await params;
  const pickup = await prisma.pickup.findUnique({ where: { id } });
  if (!pickup) return NextResponse.json({ message: "Pickup not found." }, { status: 404 });

  const isSeller = pickup.sellerEmail === session.user.email;
  const isRecycler = pickup.recyclerEmail === session.user.email;
  if (!isSeller && !isRecycler) return NextResponse.json({ message: "Access denied." }, { status: 403 });

  if (pickup.status !== "scheduled") {
    return NextResponse.json({ message: `Cannot reschedule a pickup with status "${pickup.status}".` }, { status: 400 });
  }

  const { newDate, newTimeSlot, reason } = await req.json();
  if (!newDate || !newTimeSlot) return NextResponse.json({ message: "newDate and newTimeSlot required." }, { status: 400 });
  
  if (!TIME_SLOTS.includes(newTimeSlot)) return NextResponse.json({ message: "Invalid time slot." }, { status: 400 });

  const newScheduled = new Date(newDate);
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (isNaN(newScheduled.getTime()) || newScheduled < minDate) {
    return NextResponse.json({ message: "New date must be at least 24 hours from now." }, { status: 400 });
  }

  await prisma.pickup.update({
    where: { id },
    data: {
      scheduledDate: newScheduled,
      scheduledTimeSlot: newTimeSlot,
      recyclerConfirmed: false,
      pickupNotes: reason ? `${pickup.pickupNotes || ''} (Reschedule reason: ${reason})` : pickup.pickupNotes,
    }
  });

  return NextResponse.json({ message: "Rescheduled." });
}
