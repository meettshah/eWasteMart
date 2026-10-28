"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Loader2, ArrowUpRight, ArrowDownRight, Wallet, ShieldCheck, ExternalLink, IndianRupee } from "lucide-react";
import Link from "next/link";

export default function PaymentsPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/api/orders");
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80";
      case "paid": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80";
      case "in transit": return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800/80";
      case "pickup scheduled": return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800/80";
      case "initiated": return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/80";
      case "failed": return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/80";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 dark:bg-[#090D14] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Escrow Settlement Ledger</span>
              </div>
              <h1 className="mt-0.5 font-heading text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                Payment & Escrow History
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Transparent transaction records for buyer payouts, seller deposits, and automated refund receipts.
              </p>
            </div>
          </div>
        </section>

        {/* Orders Table Container */}
        <section className="rounded-3xl border border-slate-200/80 bg-white shadow-card overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex h-56 items-center justify-center text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">Retrieving blockchain-audited transactions...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Wallet className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
              <p className="font-heading text-base font-bold text-slate-900 dark:text-white">No transactions recorded</p>
              <p className="mt-1 text-xs text-slate-400">You haven&apos;t executed or received any payments yet.</p>
              <Link href="/marketplace" className="mt-4 text-xs font-bold text-emerald-600 hover:underline">
                Explore Marketplace Lots →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Lot & Settlement ID</th>
                    <th className="px-6 py-4 font-bold">Gross Amount</th>
                    <th className="px-6 py-4 font-bold">Lifecycle State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.map((order) => {
                    const isOutgoing = session?.user?.email === order.payerEmail;
                    return (
                      <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/orders/${order._id}`} className="font-heading text-sm font-bold text-slate-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
                            {order.listingTitle}
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </Link>
                          <div className="mt-0.5 text-[11px] text-slate-400">
                            Txn: <code className="font-mono text-[10px]">{order.paytmTxnId || order.paytmOrderId}</code>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {isOutgoing ? `Beneficiary: ${order.payeeName}` : `Originator: ${order.payerName}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center gap-1 font-heading text-sm font-bold ${isOutgoing ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {isOutgoing ? <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            ₹{Number(order.amount).toLocaleString("en-IN")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${getStatusColor(order.lifecycleStatus || order.status)}`}>
                            {order.lifecycleStatus || order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
