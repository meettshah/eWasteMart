"use client";

import { useState, useCallback } from "react";
import Script from "next/script";
import axios from "axios";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

const PAYTM_STAGING_SDK = "https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/";
const PAYTM_PROD_SDK = "https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/";

const MID = process.env.NEXT_PUBLIC_PAYTM_MID || "";
const IS_STAGING = process.env.NEXT_PUBLIC_PAYTM_ENV !== "production";
const SDK_URL = (IS_STAGING ? PAYTM_STAGING_SDK : PAYTM_PROD_SDK) + MID + ".js";

export default function PaytmCheckout({ listing, bidId, amount, onSuccess, onFailure }) {
  const [step, setStep] = useState("idle"); // idle | loading | sdk_ready | paying | polling | done | error
  const [message, setMessage] = useState("");
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const pollStatus = useCallback(async (paytmOrderId) => {
    setStep("polling");
    setMessage("Confirming payment…");

    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const { data } = await axios.get(`/api/paytm/status?orderId=${paytmOrderId}`);
        if (data.status === "paid") {
          setStep("done");
          setMessage("Payment successful! You can now schedule the pickup.");
          if (onSuccess) onSuccess(data);
          return;
        }
        if (data.status === "failed") {
          setStep("error");
          setMessage("Payment was not completed. Please try again.");
          if (onFailure) onFailure(data);
          return;
        }
      } catch {}
    }

    setStep("error");
    setMessage("Could not confirm payment status. Please refresh the page.");
    if (onFailure) onFailure({ status: "unknown" });
  }, [onSuccess, onFailure]);

  const handlePayNow = useCallback(async () => {
    if (!sdkLoaded) return setMessage("Payment SDK is still loading.");

    setStep("loading"); setMessage("");

    let txnToken, paytmOrderId;
    try {
      const { data } = await axios.post("/api/paytm/initiate", { listingId: listing._id, bidId, amount });
      txnToken = data.txnToken; paytmOrderId = data.paytmOrderId;
    } catch (err) {
      setStep("error");
      setMessage(err.response?.data?.message || "Could not initiate payment.");
      return;
    }

    setStep("paying");

    if (txnToken === "MOCK_TXN_TOKEN") {
      try {
        await axios.post("/api/paytm/mock-callback", { orderId: paytmOrderId });
        pollStatus(paytmOrderId);
        return;
      } catch (e) {
        setStep("error");
        setMessage("Mock payment failed.");
        return;
      }
    }
    try {
      const config = {
        root: "", flow: "DEFAULT",
        data: { orderId: paytmOrderId, token: txnToken, tokenType: "TXN_TOKEN", amount: amount.toString() },
        handler: {
          notifyMerchant: (eventName) => { if (eventName === "APP_CLOSED") pollStatus(paytmOrderId); },
        },
      };

      if (window?.Paytm?.CheckoutJS) {
        window.Paytm.CheckoutJS.onLoad(() => {
          window.Paytm.CheckoutJS.init(config).then(() => window.Paytm.CheckoutJS.invoke()).catch(() => {
            setStep("error"); setMessage("Could not open payment window.");
          });
        });
      } else {
        setStep("error"); setMessage("Payment SDK failed to load.");
      }
    } catch {
      setStep("error"); setMessage("Payment could not be started.");
    }
  }, [sdkLoaded, listing, bidId, amount, pollStatus]);

  const isLoading = ["loading", "paying", "polling"].includes(step);

  if (step === "done") {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
        <ShieldCheck className="h-5 w-5 flex-shrink-0" />
        <div><p className="font-semibold">Payment confirmed</p><p className="mt-0.5 text-sm">{message}</p></div>
      </div>
    );
  }

  return (
    <>
      <Script src={SDK_URL} strategy="lazyOnload" crossOrigin="anonymous" onLoad={() => setSdkLoaded(true)} />
      <div className="mt-4 space-y-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">Payment required</p>
              <p className="mt-1 text-sm text-blue-700">Complete payment of <span className="font-bold">₹{amount}</span> to schedule a pickup.</p>
            </div>
          </div>
        </div>
        {message && step === "error" && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}
        {message && step === "polling" && <p className="text-sm text-gray-500">{message}</p>}
        <button onClick={handlePayNow} disabled={isLoading || !sdkLoaded} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 font-semibold text-white disabled:opacity-60">
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> {step === "polling" ? "Confirming…" : "Opening…"}</> : <><CreditCard className="h-4 w-4" /> Pay ₹{amount}</>}
        </button>
      </div>
    </>
  );
}
