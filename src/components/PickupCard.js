"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { CalendarDays, CheckCircle2, Clock3, KeyRound, Loader2, MapPin, RefreshCw, ShieldAlert, Truck, XCircle } from "lucide-react";
import { Button } from "@nextui-org/react";

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: "blue", icon: CalendarDays },
  in_progress: { label: "Recycler On The Way", color: "amber", icon: Truck },
  picked_up: { label: "OTP Verified", color: "orange", icon: CheckCircle2 },
  completed: { label: "Completed", color: "green", icon: CheckCircle2 },
  failed: { label: "Failed", color: "red", icon: XCircle },
};
const COLOR_CLASSES = {
  blue: "bg-blue-100 text-blue-800", amber: "bg-amber-100 text-amber-800",
  orange: "bg-orange-100 text-orange-800", green: "bg-green-100 text-green-800", red: "bg-red-100 text-red-800",
};

export default function PickupCard({ pickupId, onUpdate }) {
  const { data: session } = useSession();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ newDate: "", newTimeSlot: "", reason: "" });
  const [otpInput, setOtpInput] = useState("");
  const [showFail, setShowFail] = useState(false);
  const [failReason, setFailReason] = useState("");

  const email = session?.user?.email;

  const fetchPickup = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/pickup/${pickupId}`);
      setPickup(data);
    } catch { setMessage({ text: "Error loading pickup", type: "error" }); }
    finally { setLoading(false); }
  }, [pickupId]);

  useEffect(() => { fetchPickup(); }, [fetchPickup]);

  const doAction = async (label, fn) => {
    setActionLoading(label); setMessage({ text: "", type: "" });
    try {
      await fn(); await fetchPickup(); if (onUpdate) onUpdate();
    } catch (err) { setMessage({ text: err.response?.data?.message || "Action failed.", type: "error" }); }
    finally { setActionLoading(""); }
  };

  if (loading) return <div className="flex items-center gap-2 py-4 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  if (!pickup) return null;

  const isSeller = pickup.sellerEmail === email;
  const isRecycler = pickup.recyclerEmail === email;
  const cfg = STATUS_CONFIG[pickup.status] || STATUS_CONFIG.scheduled;
  const StatusIcon = cfg.icon;

  const TIME_SLOTS = ["09:00–11:00", "11:00–13:00", "14:00–16:00", "16:00–18:00"];

  return (
    <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-400">Pickup Status</p>
          <h3 className="mt-1 font-semibold text-gray-950">{pickup.listingTitle}</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${COLOR_CLASSES[cfg.color]}`}><StatusIcon className="h-3.5 w-3.5" />{cfg.label}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{new Date(pickup.scheduledDate).toLocaleDateString()}</span>
        <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{pickup.scheduledTimeSlot}</span>
        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{pickup.pickupAddress}</span>
      </div>

      {message.text && <div className={`mt-4 rounded-md px-4 py-3 text-sm ${message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>{message.text}</div>}

      <div className="mt-5 space-y-3">
        {isRecycler && pickup.status === "scheduled" && !pickup.recyclerConfirmed && (
          <Button isLoading={actionLoading === "confirm"} color="primary" variant="flat" className="w-full" onPress={() => doAction("confirm", () => axios.post(`/api/pickup/${pickupId}/confirm`))}>
            Confirm Availability
          </Button>
        )}

        {isRecycler && ["scheduled", "in_progress"].includes(pickup.status) && (
          <Button isLoading={actionLoading === "generate_otp"} color="primary" className="w-full" onPress={() => doAction("generate_otp", async () => {
            const { data } = await axios.post(`/api/pickup/${pickupId}/otp`, { action: "generate" });
            setMessage({ text: `OTP generated: ${data.otp}`, type: "info" });
          })}>Generate Arrival OTP</Button>
        )}

        {isSeller && pickup.status === "in_progress" && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input type="text" maxLength={6} value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="6-digit OTP" className="flex-1 text-center border rounded-md" />
              <Button isLoading={actionLoading === "verify_otp"} color="primary" onPress={() => doAction("verify_otp", () => axios.post(`/api/pickup/${pickupId}/otp`, { action: "verify", otp: otpInput }))}>Verify</Button>
            </div>
            {pickup.mockOtp && <span className="text-xs text-gray-500 text-center">(Testing Hint: The OTP is {pickup.mockOtp})</span>}
          </div>
        )}

        {(isSeller || isRecycler) && pickup.status === "picked_up" && (
          <Button isLoading={actionLoading === "complete"} color="success" className="w-full text-white" onPress={() => doAction("complete", () => axios.post(`/api/pickup/${pickupId}/complete`))}>Mark Completed</Button>
        )}

        {(isSeller || isRecycler) && pickup.status === "scheduled" && (
          <Button variant="flat" className="w-full" onPress={() => setShowReschedule(!showReschedule)}>Reschedule</Button>
        )}

        {showReschedule && (
          <div className="space-y-3 rounded-md border p-4">
            <input type="date" value={rescheduleForm.newDate} onChange={e => setRescheduleForm(f => ({ ...f, newDate: e.target.value }))} className="w-full" />
            <select value={rescheduleForm.newTimeSlot} onChange={e => setRescheduleForm(f => ({ ...f, newTimeSlot: e.target.value }))} className="w-full p-2 border rounded">
              <option value="">Select Time</option>
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="text" placeholder="Reason" value={rescheduleForm.reason} onChange={e => setRescheduleForm(f => ({ ...f, reason: e.target.value }))} className="w-full" />
            <Button isLoading={actionLoading === "reschedule"} color="primary" onPress={() => doAction("reschedule", () => axios.post(`/api/pickup/${pickupId}/reschedule`, rescheduleForm)).then(() => setShowReschedule(false))}>Confirm Reschedule</Button>
          </div>
        )}

        {(isSeller || isRecycler) && ["scheduled", "in_progress", "picked_up"].includes(pickup.status) && (
          <Button color="danger" variant="light" className="w-full" onPress={() => setShowFail(!showFail)}>Report Failure</Button>
        )}

        {showFail && (
          <div className="space-y-3 rounded-md border border-red-200 bg-red-50 p-4">
            <textarea value={failReason} onChange={e => setFailReason(e.target.value)} placeholder="Reason" className="w-full" />
            <Button isLoading={actionLoading === "fail"} color="danger" onPress={() => doAction("fail", () => axios.post(`/api/pickup/${pickupId}/fail`, { reason: failReason })).then(() => setShowFail(false))}>Confirm Failure</Button>
          </div>
        )}
      </div>
    </div>
  );
}
