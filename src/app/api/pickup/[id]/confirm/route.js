/**
 * POST /api/pickup/[id]/confirm
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Pickup from "@/models/Pickup";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  await mongooseConnect();
  const { id } = await params;
  const pickup = await Pickup.findById(id);
  if (!pickup) return NextResponse.json({ message: "Pickup not found" }, { status: 404 });
  
  if (pickup.recyclerEmail !== session.user.email) {
    return NextResponse.json({ message: "Only recycler can confirm" }, { status: 403 });
  }

  pickup.recyclerConfirmed = true;
  pickup.recyclerConfirmedAt = new Date();
  await pickup.save();
  
  return NextResponse.json({ message: "Confirmed" });
}
