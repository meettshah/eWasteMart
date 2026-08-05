"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Package, Truck, XCircle } from "lucide-react";
import PickupCard from "@/components/PickupCard";

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: "blue", icon: CalendarDays },
  in_progress: { label: "In Progress", color: "amber", icon: Truck },
  picked_up: { label: "Picked Up", color: "orange", icon: Package },
  completed: { label: "Completed", color: "green", icon: CheckCircle2 },
  failed: { label: "Failed", color: "red", icon: XCircle },
};

const COLOR_CLASSES = {
  blue: "bg-blue-100 text-blue-800", amber: "bg-amber-100 text-amber-800",
  orange: "bg-orange-100 text-orange-800", green: "bg-green-100 text-green-800", red: "bg-red-100 text-red-800",
};

export default function PickupsPage() {
  const { data: session } = useSession();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const role = session?.user?.role;

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/pickup");
      setPickups(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPickups(); }, []);

  const isBuyer = ["recycler", "enterprise"].includes(role);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-950">Pickups</h1>
          <p className="mt-2 text-gray-600">Track all your scheduled collections.</p>
        </section>

        <section className="space-y-4">
          {loading ? <div className="p-6">Loading...</div> : pickups.length === 0 ? <div className="p-6">No pickups yet.</div> : (
            pickups.map(pickup => {
              const cfg = STATUS_CONFIG[pickup.status] || STATUS_CONFIG.scheduled;
              const StatusIcon = cfg.icon;
              const isOpen = expanded === pickup._id;

              return (
                <div key={pickup._id} className="rounded-lg bg-white shadow-sm">
                  <button onClick={() => setExpanded(isOpen ? null : pickup._id)} className="flex w-full items-start justify-between p-5 text-left">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-600"><StatusIcon className="h-5 w-5" /></div>
                      <div>
                        <p className="font-semibold text-gray-950">{pickup.listingTitle}</p>
                        <p className="mt-1 text-xs text-gray-500">{new Date(pickup.scheduledDate).toLocaleDateString()} at {pickup.scheduledTimeSlot}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${COLOR_CLASSES[cfg.color]}`}>{cfg.label}</span>
                  </button>
                  {isOpen && <div className="border-t border-gray-100 px-5 pb-5"><PickupCard pickupId={pickup._id} onUpdate={fetchPickups} /></div>}
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
