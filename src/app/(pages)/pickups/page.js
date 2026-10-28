"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Package, Truck, XCircle, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import PickupCard from "@/components/PickupCard";
import PickupScheduler from "@/components/PickupScheduler";
import { Tabs, Tab } from "@nextui-org/react";
import Link from "next/link";

const STATUS_CONFIG = {
  needs_scheduling: { label: "Needs Scheduling", color: "amber", icon: CalendarDays },
  scheduled: { label: "Scheduled", color: "blue", icon: CalendarDays },
  in_progress: { label: "In Transit", color: "purple", icon: Truck },
  picked_up: { label: "Picked Up", color: "orange", icon: Package },
  completed: { label: "Completed", color: "emerald", icon: CheckCircle2 },
  failed: { label: "Failed", color: "rose", icon: XCircle },
};

const COLOR_CLASSES = {
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/80",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/80",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800/80",
  orange: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800/80",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/80",
};

export default function PickupsPage() {
  const { data: session } = useSession();
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
        <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
          <span className="text-xs font-semibold">Retrieving logistics tracking...</span>
        </div>
      );
    }
    
    if (pickupList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <Truck className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
          <p className="font-heading text-base font-bold text-slate-900 dark:text-white">No pickups in this queue</p>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">When listings are approved and escrow is paid, courier dispatches appear automatically here.</p>
          <Link href="/marketplace" className="mt-4 text-xs font-bold text-emerald-600 hover:underline">
            Go to Marketplace →
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-3.5 mt-4">
        {pickupList.map((pickup) => {
          const cfg = STATUS_CONFIG[pickup.status] || STATUS_CONFIG.scheduled;
          const StatusIcon = cfg.icon;
          const isOpen = expanded === pickup._id;

          return (
            <div key={pickup._id} className="rounded-3xl border border-slate-200/80 bg-white shadow-card transition-all hover:border-slate-300 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <button 
                onClick={() => setExpanded(isOpen ? null : pickup._id)} 
                className="flex w-full items-start justify-between p-5 sm:p-6 text-left focus:outline-none"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border ${COLOR_CLASSES[cfg.color]}`}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-heading text-base font-bold text-slate-900 dark:text-white">{pickup.listingTitle}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {pickup.status === "needs_scheduling" ? (
                        <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                          Payment confirmed • Date & Time selection required
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" /> {new Date(pickup.scheduledDate).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" /> {pickup.scheduledTimeSlot}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold capitalize ${COLOR_CLASSES[cfg.color]}`}>
                  {cfg.label}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-800/40">
                  {pickup.isPseudo ? (
                    <PickupScheduler 
                      listing={pickup.listing} 
                      onScheduled={() => {
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
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 dark:bg-[#090D14] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Chain of Custody Logistics</span>
              </div>
              <h1 className="mt-0.5 font-heading text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                Doorstep Pickup Management
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Schedule collections, view courier status, and verify handover with 6-digit cryptographic OTPs.
              </p>
            </div>
          </div>
        </section>

        {/* Tabs & Content */}
        <section>
          <Tabs 
            aria-label="Pickup views"
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-slate-200 dark:border-slate-800",
              cursor: "w-full bg-emerald-600",
              tab: "max-w-fit px-1 h-12",
              tabContent: "group-data-[selected=true]:text-emerald-600 font-bold text-xs"
            }}
          >
            <Tab
              key="active"
              title={
                <div className="flex items-center space-x-2">
                  <span>Active Dispatches</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {activePickups.length}
                  </span>
                </div>
              }
            >
              {renderPickupList(activePickups)}
            </Tab>
            <Tab
              key="past"
              title={
                <div className="flex items-center space-x-2">
                  <span>Completed Handings</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {pastPickups.length}
                  </span>
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
