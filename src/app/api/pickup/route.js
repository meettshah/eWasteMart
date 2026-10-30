import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  const { listingId, scheduledDate, scheduledTimeSlot, pickupNotes } = await req.json();
  
  if (!listingId || !scheduledDate || !scheduledTimeSlot) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      orders: true,
      bids: true,
    }
  });
  if (!listing) return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  
  const order = listing.orders?.[0];
  if (!order || (order.status !== "escrow_held" && order.status !== "released" && listing.payment?.status !== "paid")) {
    return NextResponse.json({ message: "Listing must be paid to schedule pickup" }, { status: 400 });
  }

  if (order.payerEmail !== session.user.email) {
    return NextResponse.json({ message: "Unauthorized. You are not the buyer." }, { status: 403 });
  }

  const recycler = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase().trim() }
  });
  if (!recycler) return NextResponse.json({ message: "Recycler profile not found" }, { status: 500 });
  
  const sellerProfile = listing.sellerId ? await prisma.user.findUnique({ where: { id: listing.sellerId } }) : null;

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  const reqDate = new Date(scheduledDate);
  if (reqDate < minDate) {
    return NextResponse.json({ message: "Pickup must be scheduled at least 24 hours in advance." }, { status: 400 });
  }

  const pickup = await prisma.pickup.create({
    data: {
      listingId,
      orderId: order.id,
      sellerId: listing.sellerId,
      sellerEmail: listing.sellerEmail,
      sellerPhone: sellerProfile?.phone || null,
      recyclerId: recycler.id,
      recyclerEmail: recycler.email,
      recyclerPhone: recycler.phone || null,
      scheduledDate: reqDate,
      scheduledTimeSlot,
      pickupAddress: listing.location,
      pickupNotes: pickupNotes || "",
      status: "scheduled",
      recyclerConfirmed: true,
    }
  });

  try {
    const { dispatchNotification } = await import("@/lib/notifications");
    await dispatchNotification({
      userId: pickup.sellerId,
      userEmail: pickup.sellerEmail,
      title: "Pickup Scheduled",
      message: `${recycler.name} has scheduled a pickup for "${listing.title}" on ${reqDate.toLocaleDateString()} at ${scheduledTimeSlot}.`,
      type: "PICKUP",
      link: `/pickups`,
      channels: ["IN_APP", "EMAIL"]
    });
  } catch (err) {
    console.error("Notification error:", err);
  }

  return NextResponse.json({ message: "Pickup scheduled", pickupId: pickup.id, _id: pickup.id });
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  const email = session.user.email?.toLowerCase().trim();
  
  const rawPickups = await prisma.pickup.findMany({
    where: {
      OR: [{ sellerEmail: email }, { recyclerEmail: email }]
    },
    include: {
      listing: true
    },
    orderBy: { createdAt: "desc" }
  });

  const pickups = rawPickups.map(p => ({
    ...p,
    _id: p.id,
    listingTitle: p.listing?.title || "E-Waste Lot",
  }));

  // Find paid listings without a pickup schedule yet
  const unscheduledListings = await prisma.listing.findMany({
    where: {
      orders: {
        some: {
          OR: [{ status: "escrow_held" }, { status: "released" }]
        }
      },
      pickups: {
        none: {}
      }
    },
    include: {
      bids: true,
      orders: true
    }
  });

  const relevantListings = unscheduledListings.filter(l => {
    const isSeller = l.sellerEmail === email;
    const approvedBid = l.bids?.find(b => b.status === "approved");
    const isBuyer = approvedBid?.bidderEmail === email;
    return isSeller || isBuyer;
  });

  const pseudoPickups = relevantListings.map(l => ({
    _id: `needs_scheduling_${l.id}`,
    id: `needs_scheduling_${l.id}`,
    isPseudo: true,
    listingId: l.id,
    listingTitle: l.title,
    status: "needs_scheduling",
    scheduledDate: new Date(), 
    scheduledTimeSlot: "Not scheduled yet",
    listing: { ...l, _id: l.id }
  }));

  return NextResponse.json([...pseudoPickups, ...pickups]);
}
