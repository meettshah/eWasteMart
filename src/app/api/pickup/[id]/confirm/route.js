import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const pickup = await prisma.pickup.findUnique({ where: { id } });
  if (!pickup) return NextResponse.json({ message: "Pickup not found" }, { status: 404 });
  
  if (pickup.recyclerEmail !== session.user.email) {
    return NextResponse.json({ message: "Only recycler can confirm" }, { status: 403 });
  }

  await prisma.pickup.update({
    where: { id },
    data: {
      recyclerConfirmed: true,
    }
  });
  
  return NextResponse.json({ message: "Confirmed" });
}
