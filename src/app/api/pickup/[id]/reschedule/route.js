/**
 * POST /api/pickup/[id]/reschedule
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Pickup from "@/models/Pickup";

const TIME_SLOTS = ["09:00–11:00", "11:00–13:00", "14:00–16:00", "16:00–18:00"];

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Please login first." }, { status: 401 });

  await mongooseConnect();

  const { id } = await params;
  const pickup = await Pickup.findById(id);
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

  pickup.rescheduleHistory.push({
    oldDate: pickup.scheduledDate,
    oldTimeSlot: pickup.scheduledTimeSlot,
    newDate: newScheduled,
    newTimeSlot,
    requestedBy: isSeller ? "seller" : "recycler",
    reason: reason || "",
  });

  pickup.scheduledDate = newScheduled;
  pickup.scheduledTimeSlot = newTimeSlot;
  pickup.recyclerConfirmed = false;
  pickup.recyclerConfirmedAt = null;
  
  await pickup.save();
  return NextResponse.json({ message: "Rescheduled." });
}
