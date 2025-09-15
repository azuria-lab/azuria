import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BillingToggleProps {
  billingCycle: "monthly" | "yearly";
  onBillingCycleChange: (value: "monthly" | "yearly") => void;
}

export default function BillingToggle({ billingCycle, onBillingCycleChange }: BillingToggleProps) {
  return (
    <div className="flex justify-center mb-12">
      <Tabs 
        value={billingCycle} 
        onValueChange={(value) => onBillingCycleChange(value as "monthly" | "yearly")}
        className="w-auto"
      >
        <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger 
            value="monthly" 
            className="px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Mensal
          </TabsTrigger>
          <TabsTrigger 
            value="yearly" 
            className="px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm relative"
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
              -17%
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}