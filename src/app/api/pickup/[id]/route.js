import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const pickup = await prisma.pickup.findUnique({
    where: { id },
    include: { listing: true, order: true }
  });
  if (!pickup) return NextResponse.json({ message: "Pickup not found" }, { status: 404 });
  
  const isSeller = pickup.sellerEmail === session.user.email;
  const isRecycler = pickup.recyclerEmail === session.user.email;
  
  if (!isSeller && !isRecycler) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({ ...pickup, _id: pickup.id });
}
