"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Loader2, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
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
      case "completed": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "paid": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "in transit": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "pickup scheduled": return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800";
      case "initiated": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "failed": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-950 dark:text-white">Payment History</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Track your incoming and outgoing transactions.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading transactions...
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <Wallet className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-700" />
              <p className="text-lg font-medium text-gray-950 dark:text-white">No transactions found</p>
              <p className="mt-1">You haven't made or received any payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Transaction details</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {orders.map((order) => {
                    const isOutgoing = session?.user?.email === order.payerEmail;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/orders/${order._id}`} className="font-semibold text-gray-950 hover:text-primary dark:text-white dark:hover:text-primary transition-colors">
                            {order.listingTitle}
                          </Link>
                          <div className="mt-0.5 text-xs text-gray-500">
                            Txn ID: {order.paytmTxnId || order.paytmOrderId}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            {isOutgoing ? `To: ${order.payeeName}` : `From: ${order.payerName}`}
                          </div>
                          <Link href={`/orders/${order._id}`} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
                            Track Order Lifecycle →
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center gap-1.5 font-semibold ${isOutgoing ? 'text-gray-950 dark:text-white' : 'text-green-600 dark:text-green-400'}`}>
                            {isOutgoing ? <ArrowUpRight className="h-4 w-4 text-gray-400" /> : <ArrowDownRight className="h-4 w-4" />}
                            Rs. {Number(order.amount).toLocaleString("en-IN")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(order.lifecycleStatus || order.status)}`}>
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
