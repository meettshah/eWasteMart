import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Login",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["BID", "PAYMENT", "PICKUP", "SYSTEM"],
      default: "SYSTEM",
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String, // Optional URL to redirect to when clicked
      default: null,
    },
  },
  { timestamps: true }
);

export const Notification = models.Notification || model("Notification", NotificationSchema);
