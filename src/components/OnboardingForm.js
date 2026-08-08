"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@nextui-org/react";
import { BadgeCheck, Building2, Factory, UserRound } from "lucide-react";

const roles = [
  { value: "user", title: "Individual seller", text: "Sell household e-waste lots.", icon: UserRound },
  { value: "bulk_seller", title: "Bulk seller", text: "List office or industry lots.", icon: Building2 },
  { value: "recycler", title: "Recycler", text: "Bid on open e-waste lots.", icon: Factory },
  { value: "enterprise", title: "Enterprise", text: "Run programmes and bid.", icon: BadgeCheck },
];

const OnboardingForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();
  
  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Force the session to refresh so NextAuth picks up the new role
        await update({ role: data.role });
        router.push("/home");
        router.refresh();
      } else {
        throw new Error("Failed to set role");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-3">
        {roles.map((role) => (
          <label
            key={role.value}
            className={`cursor-pointer rounded-xl border p-4 transition ${
              selectedRole === role.value
                ? "border-primary bg-primary/10 ring-1 ring-primary"
                : "border-gray-200 bg-white hover:border-primary/60 dark:border-gray-800 dark:bg-gray-950"
            }`}
          >
            <input {...register("role", { required: "Please select a role to continue" })} type="radio" value={role.value} className="sr-only" />
            <div className="flex items-start gap-4">
              <div className={`mt-0.5 rounded-full p-2 ${selectedRole === role.value ? "bg-primary text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                <role.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-950 dark:text-white">{role.title}</div>
                <div className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">{role.text}</div>
              </div>
            </div>
          </label>
        ))}
      </div>
      {errors.role && <p className="text-sm font-medium text-red-600">{errors.role.message}</p>}

      <Button isLoading={loading} type="submit" color="primary" className="h-12 w-full font-semibold">
        Complete Setup
      </Button>
    </form>
  );
};

export default OnboardingForm;
