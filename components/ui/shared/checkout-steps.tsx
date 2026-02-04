import React from "react";
import { cn } from "@/lib/utils";

const STEPS = ["Panier", "Livraison", "Paiement"];

const CheckoutSteps = ({ current = 0 }: { current?: number }) => {
  const progress = ((current + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-md mx-auto px-4 pt-4">
      {/* Top row */}
      <div className="flex items-end justify-between mb-3">
        <p className="text-base font-semibold leading-normal">
          {STEPS[current]}
        </p>
        <p className="text-xs font-medium uppercase tracking-wider opacity-60">
          Étape {current + 1} sur {STEPS.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Desktop labels */}
      <div className="hidden md:flex justify-between mt-4">
        {STEPS.map((step, index) => (
          <span
            key={step}
            className={cn(
              "text-xs font-bold uppercase tracking-widest",
              index <= current ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CheckoutSteps;
