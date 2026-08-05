import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import Listing from "@/models/ListingModel";

export async function POST(req) {
  // Only allow mock callbacks in staging/development mode
  if (process.env.NEXT_PUBLIC_PAYTM_ENV === "production") {
    return NextResponse.json({ message: "Mock disabled in production" }, { status: 403 });
  }

  try {
    await mongooseConnect();
    const { orderId } = await req.json();

    const order = await Order.findOne({ paytmOrderId: orderId });
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    order.status = "paid";
    order.paytmTxnId = "MOCK_TXN_" + Date.now();
    await order.save();

    const listing = await Listing.findById(order.listingId);
    if (listing) {
      listing.paymentStatus = "paid";
      listing.orderId = order._id;
      await listing.save();
    }

    return NextResponse.json({ success: true, message: "Mock payment successful" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
