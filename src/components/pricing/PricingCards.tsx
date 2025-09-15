
import PlanCard from "./PlanCard";

interface PricingCardsProps {
  billingCycle: "monthly" | "yearly";
  isLoading: boolean;
  onSubscribe: (plan: "monthly" | "yearly" | "enterprise") => void;
}

export default function PricingCards({ billingCycle, isLoading, onSubscribe }: PricingCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <PlanCard 
        plan="free" 
        billingCycle={billingCycle} 
        isLoading={isLoading} 
        onSubscribe={onSubscribe} 
      />
      <PlanCard 
        plan="pro" 
        billingCycle={billingCycle} 
        isLoading={isLoading} 
        onSubscribe={onSubscribe} 
      />
      <PlanCard 
        plan="enterprise" 
        billingCycle={billingCycle} 
        isLoading={isLoading} 
        onSubscribe={onSubscribe} 
      />
    </div>
  );
}
