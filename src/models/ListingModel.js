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
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
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
    status: {
      type: String,
      enum: ["open", "sold"],
      default: "open",
    },
    approvedBid: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    payment: {
      status: {
        type: String,
        enum: ["unpaid", "processing", "paid"],
        default: "unpaid",
      },
      method: {
        type: String,
        enum: ["currency", "token", null],
        default: null,
      },
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      paidAt: {
        type: Date,
        default: null,
      },
      transactionId: {
        type: Schema.Types.ObjectId,
        ref: "PaymentTransaction",
        default: null,
      },
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
