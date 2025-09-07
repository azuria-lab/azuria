import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check } from "lucide-react";

interface PlanCardProps {
  plan: {
    name: string;
    description: string;
    price: string;
    period: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    features: string[];
    cta: string;
    ctaLink: string;
    popular?: boolean;
    cardClass: string;
    yearlyPrice?: string;
    yearlyNote?: string;
  };
  billingCycle: "monthly" | "yearly";
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function PlanCard({ plan, billingCycle }: PlanCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative"
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-1 text-sm font-semibold shadow-lg">
            Mais Popular
          </Badge>
        </div>
      )}
      
      {plan.name === "PREMIUM" && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 text-sm font-semibold shadow-lg">
            Premium
          </Badge>
        </div>
      )}

      <Card className={plan.cardClass}>
        <CardHeader className="pb-8 pt-8">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
            <plan.icon className="h-6 w-6 text-white" />
          </div>
          
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {plan.name}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {plan.description}
          </CardDescription>
          
          <div className="pt-4">
            {billingCycle === "yearly" && plan.yearlyPrice ? (
              <motion.div
                key="yearly"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className={`text-4xl font-bold ${
                  plan.name === "PRO" ? "text-brand-600" : 
                  plan.name === "PREMIUM" ? "text-purple-600" : 
                  "text-gray-900 dark:text-white"
                }`}>
                  {plan.yearlyPrice}
                </span>
                <span className="text-gray-500 ml-2">/ano</span>
                <div className="mt-1 text-sm text-green-600 font-medium">
                  Economize 17% no anual!
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Equivale a R$ 24,92/mês vs R$ 29,90 mensal
                </div>
                <div className="mt-1 text-xs text-green-600">
                  Economia de R$ 59,80 por ano
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="monthly"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className={`text-4xl font-bold ${
                  plan.name === "PRO" ? "text-brand-600" : 
                  plan.name === "PREMIUM" ? "text-purple-600" : 
                  "text-gray-900 dark:text-white"
                }`}>
                  {plan.price}
                </span>
                <span className="text-gray-500 ml-2">{plan.period}</span>
                {plan.yearlyNote && billingCycle === "monthly" && plan.name === "PREMIUM" && (
                  <div className="mt-1 text-xs text-purple-600">
                    {plan.yearlyNote}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <ul className="space-y-3">
            {plan.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-start gap-3">
                <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  plan.name === "PREMIUM" ? "text-purple-600" : 
                  plan.name === "PRO" ? "text-brand-600" : 
                  "text-green-500"
                }`} />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter>
          {plan.name === "FREE" ? (
            <Link to={plan.ctaLink} className="w-full">
              <Button 
                variant="outline"
                className="w-full group bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                size="lg"
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Link to={plan.ctaLink} className="w-full">
              <Button 
                className={`w-full group ${
                  plan.name === "PRO" 
                    ? "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]" 
                    : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                }`}
                size="lg"
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}