import { model, models, Schema } from "mongoose";

const paymentTransactionSchema = new Schema(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    bidId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    payerId: {
      type: Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },
    payerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },
    receiverEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    method: {
      type: String,
      enum: ["currency", "token"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["initiated", "paid", "failed"],
      default: "initiated",
      index: true,
    },
    provider: {
      type: String,
      enum: ["razorpay", "ewm-token"],
      required: true,
    },
    providerOrderId: {
      type: String,
      default: null,
      index: true,
    },
    providerPaymentId: {
      type: String,
      default: null,
    },
    blockIndex: {
      type: Number,
      default: null,
    },
    previousHash: {
      type: String,
      default: null,
    },
    hash: {
      type: String,
      default: null,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

paymentTransactionSchema.index(
  { listingId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "paid" } }
);

const PaymentTransaction =
  models.PaymentTransaction || model("PaymentTransaction", paymentTransactionSchema);

export default PaymentTransaction;
