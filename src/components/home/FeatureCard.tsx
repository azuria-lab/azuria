
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  available: boolean;
}

interface FeatureCardProps {
  feature: FeatureItem;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render basic version without any Link components until router is ready
  if (!mounted) {
    return (
      <div className="block h-full">
        <Card className="h-full border-brand-100 hover:border-brand-300 hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              {feature.icon}
              {!feature.available && (
                <span className="bg-brand-100 text-brand-800 text-xs px-2 py-1 rounded-full">
                  Em breve
                </span>
              )}
            </div>
            <CardTitle className="text-lg text-brand-700 mt-2">{feature.title}</CardTitle>
            <CardDescription>{feature.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full justify-center border border-brand-100 hover:bg-brand-50 hover:text-brand-700"
              disabled
            >
              Carregando...
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Link to={feature.link} className="block h-full">
        <Card className="h-full border-brand-100 hover:border-brand-300 hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              {feature.icon}
              {!feature.available && (
                <span className="bg-brand-100 text-brand-800 text-xs px-2 py-1 rounded-full">
                  Em breve
                </span>
              )}
            </div>
            <CardTitle className="text-lg text-brand-700 mt-2">{feature.title}</CardTitle>
            <CardDescription>{feature.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full justify-center border border-brand-100 hover:bg-brand-50 hover:text-brand-700"
            >
              Acessar
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default FeatureCard;
