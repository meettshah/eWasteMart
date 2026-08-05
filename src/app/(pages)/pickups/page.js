"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Package, Truck, XCircle, Loader2 } from "lucide-react";
import PickupCard from "@/components/PickupCard";
import PickupScheduler from "@/components/PickupScheduler";
import { Tabs, Tab } from "@nextui-org/react";
import { useRouter } from "next/navigation";

const STATUS_CONFIG = {
  needs_scheduling: { label: "Needs Scheduling", color: "blue", icon: CalendarDays },
  scheduled: { label: "Scheduled", color: "blue", icon: CalendarDays },
  in_progress: { label: "In Progress", color: "amber", icon: Truck },
  picked_up: { label: "Picked Up", color: "orange", icon: Package },
  completed: { label: "Completed", color: "green", icon: CheckCircle2 },
  failed: { label: "Failed", color: "red", icon: XCircle },
};

const COLOR_CLASSES = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

export default function PickupsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  
  const fetchPickups = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/pickup");
      setPickups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPickups(); }, []);

  const activePickups = useMemo(() => pickups.filter(p => ["needs_scheduling", "scheduled", "in_progress"].includes(p.status)), [pickups]);
  const pastPickups = useMemo(() => pickups.filter(p => ["picked_up", "completed", "failed"].includes(p.status)), [pickups]);

  const renderPickupList = (pickupList) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading pickups...
        </div>
      );
    }
    
    if (pickupList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
          <Truck className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-700" />
          <p className="text-lg font-medium text-gray-950 dark:text-white">No pickups found</p>
          <p className="mt-1">You don't have any pickups in this category.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        {pickupList.map((pickup) => {
          const cfg = STATUS_CONFIG[pickup.status] || STATUS_CONFIG.scheduled;
          const StatusIcon = cfg.icon;
          const isOpen = expanded === pickup._id;

          return (
            <div key={pickup._id} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 overflow-hidden transition-all hover:ring-primary/50">
              <button 
                onClick={() => setExpanded(isOpen ? null : pickup._id)} 
                className="flex w-full items-start justify-between p-6 text-left focus:outline-none"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border ${COLOR_CLASSES[cfg.color]}`}>
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-950 dark:text-white">{pickup.listingTitle}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      {pickup.status === "needs_scheduling" ? (
                        <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">Payment completed. Action required.</span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {new Date(pickup.scheduledDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock3 className="h-4 w-4" /> {pickup.scheduledTimeSlot}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${COLOR_CLASSES[cfg.color]}`}>
                  {cfg.label}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
                  {pickup.isPseudo ? (
                    <PickupScheduler 
                      listing={pickup.listing} 
                      onScheduled={() => {
                        // After scheduling, re-fetch pickups so the pseudo turns into a real pickup
                        fetchPickups();
                      }} 
                    />
                  ) : (
                    <PickupCard pickupId={pickup._id} onUpdate={fetchPickups} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-950 dark:text-white">Pickup Management</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Track and manage your e-waste logistics</p>
            </div>
          </div>
        </section>

        <section>
          <Tabs 
            aria-label="Pickup views"
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >
            <Tab
              key="active"
              title={
                <div className="flex items-center space-x-2">
                  <span>Active Pickups</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{activePickups.length}</span>
                </div>
              }
            >
              {renderPickupList(activePickups)}
            </Tab>
            <Tab
              key="past"
              title={
                <div className="flex items-center space-x-2">
                  <span>Past Pickups</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{pastPickups.length}</span>
                </div>
              }
            >
              {renderPickupList(pastPickups)}
            </Tab>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
