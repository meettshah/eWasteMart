"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock3, MapPin, Package, Truck, Wallet, FileText, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    { id: 5, label: "Completed", icon: CheckCircle2, date: pickup?.completedAt, pending: currentStep < 5 },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/payments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200">
          <ArrowLeft className="h-4 w-4" /> Back to Payment History
        </Link>

        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-950 dark:text-white">Order: {listing?.title}</h1>
              <p className="mt-1 text-gray-500">Txn ID: {order.paytmTxnId || order.paytmOrderId}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="text-sm text-gray-500">Amount</div>
              <div className="text-2xl font-bold text-gray-950 dark:text-white">Rs. {Number(order.amount).toLocaleString("en-IN")}</div>
              <div className="mt-1 text-xs font-medium text-gray-500 uppercase">{isOutgoing ? `Paid to ${order.payeeName}` : `Received from ${order.payerName}`}</div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="text-lg font-bold text-gray-950 dark:text-white mb-8">Order Lifecycle</h2>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>
            
            <div className="space-y-8">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isPending = step.pending;

                let colorClasses = "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:border-gray-700";
                if (isCompleted) colorClasses = "bg-primary text-white border-primary shadow-md shadow-primary/20";
                if (isCurrent) colorClasses = "bg-white text-primary border-primary border-2 dark:bg-gray-950 shadow-lg shadow-primary/10";

                return (
                  <div key={step.id} className="relative flex gap-6 z-10">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${colorClasses}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="pt-2">
                      <h3 className={`text-lg font-semibold ${isPending ? 'text-gray-400 dark:text-gray-600' : 'text-gray-950 dark:text-white'}`}>
                        {step.label}
                      </h3>
                      {step.date && !isPending && (
                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(step.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      )}
                      {isCurrent && step.id === 2 && (
                        <div className="mt-3">
                          <Link href="/pickups" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                            Schedule Pickup
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
