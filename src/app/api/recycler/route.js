import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const RECYCLER_ROLES = ["recycler", "enterprise"];

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (email) {
    if (email !== session.user.email) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const ownProfile = await prisma.recyclerProfile.findFirst({
      where: { email }
    });
    return NextResponse.json(ownProfile ? { ...ownProfile, _id: ownProfile.id } : null);
  }

  const recyclers = await prisma.recyclerProfile.findMany({
    select: {
      id: true,
      name: true,
      typeWaste: true,
      description: true,
      images: true,
      properties: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(recyclers.map(r => ({ ...r, _id: r.id })));
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }
  if (!RECYCLER_ROLES.includes(session.user.role)) {
    return NextResponse.json({ message: "Only recyclers and enterprises can create recycler profiles." }, { status: 403 });
  }

  const body = await req.json();
  if (!body.name || !body.typeWaste || !body.address) {
    return NextResponse.json({ message: "Name, waste type and address are required." }, { status: 400 });
  }

  const recycler = await prisma.recyclerProfile.create({
    data: {
      ownerId: session.user.id,
      name: body.name,
      email: session.user.email,
      typeWaste: body.typeWaste,
      address: body.address,
      images: body.images || [],
      description: body.description || "",
      properties: body.properties || [],
    }
  });

  return NextResponse.json({
    message: "Recycler profile created.",
    recycler: { ...recycler, _id: recycler.id }
  }, { status: 201 });
}
