"use client";

import { CalendarCheck, CalendarPlus } from "lucide-react";
import { addPlan, removePlan, type Plan } from "@/lib/plans";
import { savePlans, usePlans } from "./plansStore";

// "I'm going": remembered only on this device. Works without an account.
export function GoingButton({ plan }: { plan: Plan }) {
  const plans = usePlans();
  const going = plans.some((p) => p.id === plan.id);
  return (
    <button
      type="button"
      aria-pressed={going}
      title={going ? "Saved on this device only. Tap to remove." : "Remember this show on this device. Nothing is sent to TourTix."}
      onClick={() => savePlans(going ? removePlan(plans, plan.id) : addPlan(plans, plan))}
      className={`flex min-h-11 items-center gap-2 text-sm font-medium hover:underline ${going ? "text-live" : "text-accent"}`}
    >
      {going ? <CalendarCheck size={18} aria-hidden className="pop" /> : <CalendarPlus size={18} aria-hidden />}
      {going ? "I'm going" : "Mark as going"}
    </button>
  );
}
