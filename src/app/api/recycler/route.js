import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Recycler from "@/models/RecyclerModel";

const RECYCLER_ROLES = ["recycler", "enterprise"];

export async function GET(req) {
  await mongooseConnect();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (email) {
    return NextResponse.json(await Recycler.findOne({ email }));
  }

  return NextResponse.json(await Recycler.find().sort({ createdAt: -1 }));
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }
  if (!RECYCLER_ROLES.includes(session.user.role)) {
    return NextResponse.json({ message: "Only recyclers and enterprises can create recycler profiles." }, { status: 403 });
  }

  await mongooseConnect();
  const body = await req.json();
  if (!body.name || !body.typeWaste || !body.address) {
    return NextResponse.json({ message: "Name, waste type and address are required." }, { status: 400 });
  }

  const recycler = await Recycler.create({
    ownerId: session.user.id,
    name: body.name,
    email: session.user.email,
    typeWaste: body.typeWaste,
    address: body.address,
    images: body.images || [],
    description: body.description || "",
    properties: body.properties || [],
  });

  return NextResponse.json({ message: "Recycler profile created.", recycler }, { status: 201 });
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  await mongooseConnect();
  const body = await req.json();
  const recycler = await Recycler.findOne({ _id: body._id, email: session.user.email });
  if (!recycler) {
    return NextResponse.json({ message: "Recycler profile not found." }, { status: 404 });
  }

  recycler.name = body.name || recycler.name;
  recycler.typeWaste = body.typeWaste || recycler.typeWaste;
  recycler.address = body.address || recycler.address;
  recycler.images = body.images || recycler.images;
  recycler.description = body.description || recycler.description;
  recycler.properties = body.properties || recycler.properties;
  await recycler.save();

  return NextResponse.json({ message: "Recycler profile updated.", recycler });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  await mongooseConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Profile id is required." }, { status: 400 });
  }

  await Recycler.deleteOne({ _id: id, email: session.user.email });
  return NextResponse.json({ message: "Recycler profile deleted." });
}
