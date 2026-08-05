import { model, models, Schema } from "mongoose";

const bidSchema = new Schema(
  {
    bidderId: {
      type: Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },
    bidderName: {
      type: String,
      required: true,
    },
    bidderEmail: {
      type: String,
      required: true,
    },
    bidderRole: {
      type: String,
      enum: ["recycler", "enterprise"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 48 * 60 * 60 * 1000), // Default 48 hours
    },
    counterOffer: {
      amount: { type: Number },
      message: { type: String },
      status: { type: String, enum: ["pending", "accepted", "rejected"] },
    }
  },
  { timestamps: true }
);

const listingSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    sellerEmail: {
      type: String,
      required: true,
    },
    sellerRole: {
      type: String,
      enum: ["user", "bulk_seller", "enterprise"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      enum: ["items", "kg", "tons"],
      default: "items",
    },
    condition: {
      type: String,
      enum: ["working", "repairable", "scrap", "mixed"],
      default: "mixed",
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    askingPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    hagglingLimit: {
      type: String,
      enum: ["strict", "open"],
      default: "strict", // strict = 1 round, open = up to 3 rounds
    },
    status: {
      type: String,
      enum: ["open", "sold", "closed"],
      default: "open",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid"
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },
    pickupId: {
      type: Schema.Types.ObjectId,
      ref: "Pickup",
      default: null
    },
    approvedBid: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    bids: {
      type: [bidSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Listing = models.Listing || model("Listing", listingSchema);

export default Listing;
