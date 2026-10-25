"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock3, MapPin, Package, Truck, Wallet, FileText, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { motion } from "framer-motion";

export default function OrderDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data: orderData } = await axios.get(`/api/orders/${params.id}`);
        setData(orderData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (params?.id) fetchOrderDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Link href="/payments" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Payments
        </Link>
      </div>
    );
  }

  const { order, listing, pickup } = data;
  const isOutgoing = session?.user?.email === order.payerEmail;

  // Determine current step (1 to 5)
  let currentStep = 1; // Bid Accepted / Order Created
  if (order.status === "paid") currentStep = 2;
  if (pickup) currentStep = 3; // Scheduled
  if (pickup?.status === "in_progress" || pickup?.status === "picked_up") currentStep = 4;
  if (pickup?.status === "completed") currentStep = 5;

  const steps = [
    { id: 1, label: "Bid Accepted", icon: FileText, date: order.createdAt },
    { id: 2, label: "Payment Completed", icon: Wallet, date: order.updatedAt, pending: order.status !== "paid" },
    { id: 3, label: "Pickup Scheduled", icon: Clock3, date: pickup?.createdAt, pending: !pickup },
    { id: 4, label: "In Transit", icon: Truck, date: pickup?.inProgressAt, pending: !pickup || currentStep < 4 },
    { id: 5, label: "Safely Processed", icon: CheckCircle2, date: pickup?.completedAt, pending: currentStep < 5 },
  ];

  return (
    <main className="min-h-screen bg-gray-50/50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/payments" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary dark:hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Payment History
        </Link>

        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-950 dark:text-white">Order: {listing?.title}</h1>
              <p className="mt-2 font-mono text-sm text-gray-500">Txn ID: {order.paytmTxnId || order.paytmOrderId}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white/60 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
              <div className="text-sm font-medium text-gray-500">Amount</div>
              <div className="text-3xl font-black text-gray-950 dark:text-white">Rs. {Number(order.amount).toLocaleString("en-IN")}</div>
              <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span className={`h-2 w-2 rounded-full ${isOutgoing ? 'bg-red-500' : 'bg-green-500'}`}></span>
                {isOutgoing ? `Paid to ${order.payeeName}` : `Received from ${order.payerName}`}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Interactive E-Waste Lifecycle Stepper */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card overflow-hidden rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white mb-10">Lifecycle Tracker</h2>
          
          <div className="relative">
            {/* Horizontal Line for Desktop */}
            <div className="absolute left-0 top-6 hidden h-1 w-full bg-gray-200 dark:bg-gray-800 md:block">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-primary"
              />
            </div>
            
            <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-0">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isPending = step.pending;

                let iconStyles = "bg-gray-100 text-gray-400 border-2 border-gray-200 dark:bg-gray-900 dark:border-gray-800";
                if (isCompleted) iconStyles = "bg-primary text-white border-2 border-primary shadow-lg shadow-primary/30";
                if (isCurrent) iconStyles = "bg-white text-primary border-2 border-primary dark:bg-gray-950 shadow-xl shadow-primary/40 ring-4 ring-primary/20";

                return (
                  <div key={step.id} className="relative z-10 flex flex-row items-center gap-4 md:flex-col md:text-center md:items-center">
                    {/* Vertical line for mobile */}
                    {idx !== steps.length - 1 && (
                      <div className="absolute left-[1.35rem] top-12 bottom-[-2rem] w-0.5 bg-gray-200 dark:bg-gray-800 md:hidden">
                         <div className={`h-full ${isCompleted ? 'bg-primary' : ''}`} />
                      </div>
                    )}
                    
                    <motion.div 
                      whileHover={{ scale: isPending ? 1 : 1.1 }}
                      className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all ${iconStyles}`}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    
                    <div className="pt-1 md:w-32 md:pt-4">
                      <h3 className={`text-sm font-bold ${isPending ? 'text-gray-400 dark:text-gray-600' : 'text-gray-950 dark:text-white'}`}>
                        {step.label}
                      </h3>
                      {step.date && !isPending && (
                        <p className="mt-1 text-xs font-medium text-gray-500">
                          {new Date(step.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </p>
                      )}
                      
                      {isCurrent && step.id === 2 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 md:absolute md:left-1/2 md:-translate-x-1/2 md:w-max"
                        >
                          <Link href="/pickups" className="inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary/90 hover:shadow-lg transition-all">
                            Schedule Pickup
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
