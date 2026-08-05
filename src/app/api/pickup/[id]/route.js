/**
 * GET /api/pickup/[id]
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Pickup from "@/models/Pickup";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  await mongooseConnect();
  
  const { id } = await params;
  const pickup = await Pickup.findById(id);
  if (!pickup) return NextResponse.json({ message: "Pickup not found" }, { status: 404 });
  
  const isSeller = pickup.sellerEmail === session.user.email;
  const isRecycler = pickup.recyclerEmail === session.user.email;
  
  if (!isSeller && !isRecycler) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json(pickup);
}
