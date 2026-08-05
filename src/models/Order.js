import mongoose, { Schema, model, models } from "mongoose";

/**
 * Order — full transaction ledger for a single bid payment.
 * Lifecycle: pending → initiated → paid → (refund_requested → refunded)
 * Payout to seller is triggered only after pickup is marked "completed".
 */
const OrderSchema = new Schema(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    bidId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    /** Buyer (recycler / enterprise) who initiated payment */
    payerId: {
      type: Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },
    payerName: { type: String, required: true },
    payerEmail: { type: String, required: true },

    /** Seller who will receive the payout */
    payeeId: {
      type: Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },
    payeeName: { type: String, required: true },
    payeeEmail: { type: String, required: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    // ─── Paytm identifiers ────────────────────────────────────────────────────
    /** Internal order ID we generate: EWM-<timestamp>-<hex> */
    paytmOrderId: { type: String, unique: true, sparse: true },
    /** Paytm's own transaction ID returned after successful payment */
    paytmTxnId: { type: String, default: null },
    /** Short-lived token used by Checkout JS SDK */
    paytmTxnToken: { type: String, default: null },

    // ─── Transaction state machine ────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "initiated", "paid", "failed", "refund_requested", "refunded"],
      default: "pending",
    },

    // ─── Refund ───────────────────────────────────────────────────────────────
    /** Unique refId per refund attempt — Paytm rejects duplicate refIds */
    refundId: { type: String, default: null },
    refundAmount: { type: Number, default: null },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "success", "failed"],
      default: "none",
    },
    refundReason: { type: String, default: null },
    refundInitiatedAt: { type: Date, default: null },

    // ─── Payout to seller ─────────────────────────────────────────────────────
    payoutStatus: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "pending",
    },
    payoutAt: { type: Date, default: null },

    /** Raw Paytm callback payload stored verbatim for audit / reconciliation */
    paytmRawCallback: { type: Object, default: null },
  },
  { timestamps: true }
);

// Index for fast lookup (handled by unique property)
OrderSchema.index({ listingId: 1 });
OrderSchema.index({ payerId: 1 });

export const Order = models.Order || model("Order", OrderSchema);