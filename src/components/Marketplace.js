"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@nextui-org/react";
import PaytmCheckout from "@/components/PaytmCheckout";
import PickupScheduler from "@/components/PickupScheduler";
import PickupCard from "@/components/PickupCard";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

const SELLER_ROLES = ["user", "bulk_seller", "enterprise"];
const BIDDER_ROLES = ["recycler", "enterprise"];

const categories = [
  "Computers and peripherals",
  "Mobile and personal devices",
  "Televisions and displays",
  "Audio and video equipment",
  "Networking devices",
  "Batteries and chargers",
  "Mixed e-waste",
];

const emptyListing = {
  title: "",
  category: categories[0],
  quantity: 1,
  unit: "items",
  condition: "mixed",
  location: "",
  askingPrice: "",
  description: "",
};

export default function Marketplace() {
  const { data: session } = useSession();
  const [listings, setListings] = useState([]);
  const [listingForm, setListingForm] = useState(emptyListing);
  const [bidForms, setBidForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const role = session?.user?.role;
  const canSell = SELLER_ROLES.includes(role);
  const canBid = BIDDER_ROLES.includes(role);

  const stats = useMemo(() => {
    const open = listings.filter((listing) => listing.status === "open").length;
    const bids = listings.reduce((count, listing) => count + (listing.bids?.length || 0), 0);
    return { open, bids, sold: listings.length - open };
  }, [listings]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/listings");
      setListings(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load marketplace listings.");
    } finally {
      setLoading(false);
    }
  };

  // Read Paytm callback query param and show banner
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setMessage("✓ Payment confirmed! You can now schedule a pickup.");
      router.replace("/marketplace"); // clean URL
    } else if (payment === "failed") {
      setMessage("Payment was not completed. Please try again.");
      router.replace("/marketplace");
    } else if (payment === "tampered") {
      setMessage("Payment verification failed. Please contact support.");
      router.replace("/marketplace");
    }
  }, [searchParams, router]);

  useEffect(() => {
    loadListings();
  }, []);

  const updateListingField = (field, value) => {
    setListingForm((current) => ({ ...current, [field]: value }));
  };

  const updateBidField = (listingId, field, value) => {
    setBidForms((current) => ({
      ...current,
      [listingId]: { amount: "", message: "", ...current[listingId], [field]: value },
    }));
  };

  const createListing = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await axios.post("/api/listings", listingForm);
      setListingForm(emptyListing);
      setMessage("Listing created. Recyclers and enterprises can now bid.");
      await loadListings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create listing.");
    } finally {
      setSaving(false);
    }
  };

  const placeBid = async (listingId) => {
    setSaving(true);
    setMessage("");
    try {
      await axios.post(`/api/listings/${listingId}/bid`, bidForms[listingId] || {});
      setBidForms((current) => ({ ...current, [listingId]: { amount: "", message: "" } }));
      setMessage("Bid placed successfully.");
      await loadListings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not place bid.");
    } finally {
      setSaving(false);
    }
  };

  const approveBid = async (listingId, bidId) => {
    setSaving(true);
    setMessage("");
    try {
      await axios.post(`/api/listings/${listingId}/approve`, { bidId });
      setMessage("Bid approved. This e-waste lot is now sold to the selected buyer.");
      await loadListings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not approve bid.");
    } finally {
      setSaving(false);
    }
  };

  const sendCounterOffer = async (listingId, bidId, amount) => {
    setSaving(true);
    setMessage("");
    try {
      await axios.post(`/api/listings/${listingId}/bid/${bidId}/counter`, { amount: Number(amount) });
      setMessage("Counter offer sent successfully.");
      await loadListings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not send counter offer.");
    } finally {
      setSaving(false);
    }
  };

  const respondCounterOffer = async (listingId, bidId, action) => {
    setSaving(true);
    setMessage("");
    try {
      await axios.post(`/api/listings/${listingId}/bid/${bidId}/counter`, { action });
      setMessage(`Counter offer ${action}ed.`);
      await loadListings();
    } catch (error) {
      setMessage(error.response?.data?.message || `Could not ${action} counter offer.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Role based marketplace</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">E-Waste bidding desk</h1>
              <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-300">
                Sellers list e-waste lots, recyclers and enterprises bid, and the seller approves one buyer.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border p-3 dark:border-gray-800">
                <div className="text-2xl font-bold text-gray-950 dark:text-white">{stats.open}</div>
                <div className="text-xs text-gray-500">Open</div>
              </div>
              <div className="rounded-md border p-3 dark:border-gray-800">
                <div className="text-2xl font-bold text-gray-950 dark:text-white">{stats.bids}</div>
                <div className="text-xs text-gray-500">Bids</div>
              </div>
              <div className="rounded-md border p-3 dark:border-gray-800">
                <div className="text-2xl font-bold text-gray-950 dark:text-white">{stats.sold}</div>
                <div className="text-xs text-gray-500">Sold</div>
              </div>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">Create e-waste listing</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Available for individual sellers, bulk sellers and enterprises.
            </p>

            {!canSell ? (
              <div className="mt-5 rounded-md bg-gray-100 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                Your current role is {role}. Recyclers can bid, but cannot create seller listings.
              </div>
            ) : (
              <form onSubmit={createListing} className="mt-5 space-y-4">
                <input
                  value={listingForm.title}
                  onChange={(event) => updateListingField("title", event.target.value)}
                  placeholder="Lot title"
                  className="w-full"
                  required
                />
                <select
                  value={listingForm.category}
                  onChange={(event) => updateListingField("category", event.target.value)}
                  className="w-full"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="1"
                    value={listingForm.quantity}
                    onChange={(event) => updateListingField("quantity", event.target.value)}
                    placeholder="Quantity"
                    required
                  />
                  <select value={listingForm.unit} onChange={(event) => updateListingField("unit", event.target.value)}>
                    <option value="items">Items</option>
                    <option value="kg">Kg</option>
                    <option value="tons">Tons</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={listingForm.condition} onChange={(event) => updateListingField("condition", event.target.value)}>
                    <option value="working">Working</option>
                    <option value="repairable">Repairable</option>
                    <option value="scrap">Scrap</option>
                    <option value="mixed">Mixed</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={listingForm.askingPrice}
                    onChange={(event) => updateListingField("askingPrice", event.target.value)}
                    placeholder="Expected price"
                  />
                </div>
                <input
                  value={listingForm.location}
                  onChange={(event) => updateListingField("location", event.target.value)}
                  placeholder="Pickup location"
                  className="w-full"
                  required
                />
                <textarea
                  value={listingForm.description}
                  onChange={(event) => updateListingField("description", event.target.value)}
                  placeholder="Describe devices, brands, condition and pickup notes"
                  className="min-h-28 w-full"
                  required
                />
                <Button isLoading={saving} type="submit" color="primary" className="w-full font-semibold">
                  Publish listing
                </Button>
              </form>
            )}
          </section>

          <section className="space-y-5">
            {loading ? (
              <div className="rounded-lg bg-white p-6 text-gray-600 shadow-sm dark:bg-gray-900 dark:text-gray-300">Loading listings...</div>
            ) : listings.length === 0 ? (
              <div className="rounded-lg bg-white p-6 text-gray-600 shadow-sm dark:bg-gray-900 dark:text-gray-300">No listings yet. Create the first e-waste lot.</div>
            ) : (
              listings.map((listing) => {
                const isOwner = listing.sellerEmail === session?.user?.email;
                const bidForm = bidForms[listing._id] || { amount: "", message: "" };
                const approvedBid = listing.bids?.find((bid) => bid.status === "approved");
                const isParticipant = (session?.user?.email === listing.sellerEmail) || (approvedBid?.bidderEmail === session?.user?.email);
                const isSoldOut = listing.paymentStatus === "paid";
                const isCompletelySoldOut = isSoldOut && !isParticipant;

                return (
                  <article key={listing._id} className={`rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900 ${isCompletelySoldOut ? 'opacity-60 grayscale-[0.5] pointer-events-none' : ''}`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold text-gray-950 dark:text-white">{listing.title}</h2>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isSoldOut ? 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : listing.status === "open" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                            {isSoldOut ? 'SOLD OUT' : listing.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {listing.category} | {listing.quantity} {listing.unit} | {listing.condition} | {listing.location}
                        </p>
                        <p className="mt-3 text-gray-700 dark:text-gray-300">{listing.description}</p>
                      </div>
                      <div className="rounded-md border p-3 text-right dark:border-gray-800">
                        <div className="text-xs text-gray-500">Expected price</div>
                        <div className="text-xl font-bold text-gray-950 dark:text-white">
                          Rs. {Number(listing.askingPrice || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Seller: {listing.sellerName}</div>
                        <div className="text-xs text-gray-500">Role: {listing.sellerRole}</div>
                      </div>
                    </div>

                    {approvedBid && (
                      <div className="mt-5 rounded-md bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                        Sold to {approvedBid.bidderName} for Rs. {Number(approvedBid.amount).toLocaleString("en-IN")}.
                      </div>
                    )}

                    {/* ─── Payment & Pickup flow ─────────────────────────────── */}
                    {listing.status === "sold" && (() => {
                      const isApprovedBuyer =
                        approvedBid?.bidderEmail === session?.user?.email;

                      // Approved buyer sees Pay Now if unpaid
                      if (isApprovedBuyer && listing.paymentStatus === "unpaid") {
                        return (
                          <PaytmCheckout
                            listing={listing}
                            bidId={approvedBid._id}
                            amount={approvedBid.amount}
                            onSuccess={loadListings}
                            onFailure={loadListings}
                          />
                        );
                      }

                      // Approved buyer sees Schedule Pickup if paid but no pickup yet
                      if (isApprovedBuyer && listing.paymentStatus === "paid" && !listing.pickupId) {
                        return (
                          <PickupScheduler listing={listing} onScheduled={loadListings} />
                        );
                      }

                      // Both seller and buyer see PickupCard if pickup exists
                      if (listing.pickupId && (isOwner || isApprovedBuyer)) {
                        return <PickupCard pickupId={listing.pickupId} onUpdate={loadListings} />;
                      }

                      // Seller sees payment status notice
                      if (isOwner && listing.paymentStatus === "unpaid") {
                        return (
                          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                            Waiting for the buyer to complete payment before pickup can be scheduled.
                          </div>
                        );
                      }

                      return null;
                    })()}

                    {listing.status === "open" && canBid && !isOwner && (
                      <div className="mt-5 grid gap-3 rounded-md border p-4 dark:border-gray-800 md:grid-cols-[160px_1fr_auto]">
                        <input
                          type="number"
                          min="1"
                          value={bidForm.amount}
                          onChange={(event) => updateBidField(listing._id, "amount", event.target.value)}
                          placeholder="Bid amount"
                        />
                        <input
                          value={bidForm.message}
                          onChange={(event) => updateBidField(listing._id, "message", event.target.value)}
                          placeholder="Pickup timeline or compliance note"
                        />
                        <Button isLoading={saving} color="primary" onPress={() => placeBid(listing._id)}>
                          Place bid
                        </Button>
                      </div>
                    )}

                    <div className="mt-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Bids</h3>
                      <div className="mt-3 space-y-3">
                        {listing.bids?.length ? listing.bids.map((bid) => {
                          const isBidder = session?.user?.email === bid.bidderEmail;
                          const hasPendingCounter = bid.counterOffer?.status === "pending";
                          
                          return (
                          <div key={bid._id} className="flex flex-col gap-3 rounded-md border p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="font-semibold text-gray-950 dark:text-white">
                                Rs. {Number(bid.amount).toLocaleString("en-IN")} by {bid.bidderName}
                              </div>
                              <div className="text-sm text-gray-500">{bid.bidderRole} | {bid.status}</div>
                              {bid.message && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{bid.message}</p>}
                              
                              {bid.counterOffer && (
                                <div className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                  Counter Offer: Rs. {Number(bid.counterOffer.amount).toLocaleString("en-IN")} ({bid.counterOffer.status})
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                              {isOwner && listing.status === "open" && bid.status === "pending" && (
                                <>
                                  {!hasPendingCounter && (
                                    <div className="flex items-center gap-2 mr-2">
                                      <input 
                                        type="number" 
                                        placeholder="Counter amount" 
                                        className="w-32 px-2 py-1 text-sm border rounded-md dark:border-gray-700 dark:bg-gray-800"
                                        id={`counter-${bid._id}`} 
                                      />
                                      <Button size="sm" isLoading={saving} color="warning" variant="flat" onPress={() => {
                                        const amt = document.getElementById(`counter-${bid._id}`).value;
                                        if (amt) sendCounterOffer(listing._id, bid._id, amt);
                                      }}>Counter</Button>
                                    </div>
                                  )}
                                  <Button size="sm" isLoading={saving} color="success" onPress={() => approveBid(listing._id, bid._id)}>
                                    Approve buyer
                                  </Button>
                                </>
                              )}
                              
                              {isBidder && hasPendingCounter && (
                                <div className="flex gap-2">
                                  <Button size="sm" isLoading={saving} color="success" onPress={() => respondCounterOffer(listing._id, bid._id, "accept")}>Accept</Button>
                                  <Button size="sm" isLoading={saving} color="danger" variant="flat" onPress={() => respondCounterOffer(listing._id, bid._id, "reject")}>Reject</Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}) : (
                          <div className="rounded-md border border-dashed p-4 text-sm text-gray-500 dark:border-gray-800">
                            No bids yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
