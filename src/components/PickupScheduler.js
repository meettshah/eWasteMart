"use client";

import { useState } from "react";
import axios from "axios";
import { CalendarDays, Clock3, MapPin, Loader2, CheckCircle2, StickyNote } from "lucide-react";
import { Button } from "@nextui-org/react";

const TIME_SLOTS = [
  { value: "09:00–11:00", label: "9 AM – 11 AM" },
  { value: "11:00–13:00", label: "11 AM – 1 PM" },
  { value: "14:00–16:00", label: "2 PM – 4 PM" },
  { value: "16:00–18:00", label: "4 PM – 6 PM" },
];

function getMinDate() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}

export default function PickupScheduler({ listing, onScheduled }) {
  const [form, setForm] = useState({ scheduledDate: "", scheduledTimeSlot: "", pickupNotes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scheduledDate || !form.scheduledTimeSlot) { setError("Select date and time"); return; }
    setLoading(true); setError("");
    try {
      const { data } = await axios.post("/api/pickup", { listingId: listing._id, ...form });
      setSuccess(true);
      if (onScheduled) onScheduled(data);
    } catch (err) {
      setError(err.response?.data?.message || "Error scheduling pickup.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
        <div><p className="font-semibold">Pickup scheduled!</p><p className="mt-0.5 text-sm">Seller notified.</p></div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-5">
      <p className="mb-4 font-semibold text-gray-950">Schedule Pickup</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><CalendarDays className="h-4 w-4" /> Pickup Date</label>
          <input type="date" min={getMinDate()} value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} className="w-full" required />
        </div>
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"><Clock3 className="h-4 w-4" /> Time Slot</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIME_SLOTS.map(slot => (
              <label key={slot.value} className={`cursor-pointer rounded-md border px-3 py-2.5 text-center text-sm transition ${form.scheduledTimeSlot === slot.value ? "border-blue-600 bg-blue-50 text-blue-600" : "bg-white text-gray-700"}`}>
                <input type="radio" name="timeSlot" value={slot.value} checked={form.scheduledTimeSlot === slot.value} onChange={() => setForm(f => ({ ...f, scheduledTimeSlot: slot.value }))} className="sr-only" />
                {slot.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><MapPin className="h-4 w-4" /> Address</label>
          <input type="text" value={listing.location} readOnly className="w-full bg-gray-100 text-gray-500" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><StickyNote className="h-4 w-4" /> Notes (optional)</label>
          <textarea value={form.pickupNotes} onChange={e => setForm(f => ({ ...f, pickupNotes: e.target.value }))} className="min-h-20 w-full" />
        </div>
        {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Button isLoading={loading} type="submit" color="primary" className="w-full font-semibold">Confirm Pickup</Button>
      </form>
    </div>
  );
}
