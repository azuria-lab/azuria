
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

interface BillingToggleProps {
  billingCycle: "monthly" | "yearly";
  setBillingCycle: (value: "monthly" | "yearly") => void;
}

export default function BillingToggle({ billingCycle, setBillingCycle }: BillingToggleProps) {
  return (
    <motion.div variants={itemVariants} className="mb-8 flex justify-center">
      <Tabs 
        defaultValue="monthly" 
        value={billingCycle} 
        onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
        className="w-full max-w-md"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
          <TabsTrigger value="yearly">
            Anual
            <span className="ml-2 py-0.5 px-2 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              -17%
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </motion.div>
  );
}
