import { model, models, Schema } from "mongoose";

/**
 * Pickup — tracks the full physical pickup lifecycle after payment.
 *
 * State machine:
 *   scheduled → in_progress  (recycler arrives, generates OTP)
 *   in_progress → picked_up  (seller verifies OTP)
 *   picked_up → completed    (either party confirms handoff done → triggers payout)
 *   picked_up → failed       (handoff failed → triggers refund)
 *   scheduled → failed       (no-show / cancellation → triggers refund)
 */
const rescheduleEntrySchema = new Schema(
  {
    oldDate: { type: Date, required: true },
    oldTimeSlot: { type: String, required: true },
    newDate: { type: Date, required: true },
    newTimeSlot: { type: String, required: true },
    requestedBy: { type: String, enum: ["seller", "recycler"], required: true },
    reason: { type: String, default: "" },
  },
  { _id: false, timestamps: { createdAt: "at", updatedAt: false } }
);

const PickupSchema = new Schema(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerPhone: { type: String, default: null }, // used for OTP SMS delivery

    recyclerId: {
      type: Schema.Types.ObjectId,
      ref: "Login",
      required: true,
      index: true,
    },
    recyclerName: { type: String, required: true },
    recyclerEmail: { type: String, required: true },

    listingTitle: { type: String, required: true }, // denormalized for quick display

    // ─── Schedule ─────────────────────────────────────────────────────────────
    scheduledDate: { type: Date, required: true },
    scheduledTimeSlot: { type: String, required: true }, // "09:00–11:00"
    pickupAddress: { type: String, required: true },
    pickupNotes: { type: String, default: "" },

    // ─── Recycler confirmation ────────────────────────────────────────────────
    recyclerConfirmed: { type: Boolean, default: false },
    recyclerConfirmedAt: { type: Date, default: null },

    // ─── Reschedule audit trail ───────────────────────────────────────────────
    rescheduleHistory: { type: [rescheduleEntrySchema], default: [] },

    // ─── OTP (single-use, bcrypt-hashed, 15-min TTL) ─────────────────────────
    /** bcrypt hash of the 6-digit OTP — never stored in plain text */
    otpHash: { type: String, default: null, select: false },
    otpExpiry: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    otpAttempts: { type: Number, default: 0 }, // rate-limit brute force

    // ─── Status state machine ─────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "picked_up", "completed", "failed"],
      default: "scheduled",
      index: true,
    },

    // Timestamps for each transition (kept alongside mongoose timestamps)
    inProgressAt: { type: Date, default: null },
    pickedUpAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    failureReason: { type: String, default: null },

    // ─── Post-completion ratings ──────────────────────────────────────────────
    sellerRating: { type: Number, min: 1, max: 5, default: null },
    recyclerRating: { type: Number, min: 1, max: 5, default: null },
  },
  { timestamps: true }
);

const Pickup = models.Pickup || model("Pickup", PickupSchema);

export default Pickup;
