import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface RealTimeMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ElementType;
  color: string;
}

interface RealTimeMetricsProps {
  metrics: RealTimeMetric[];
  isLive: boolean;
}

export default function RealTimeMetrics({ metrics, isLive }: RealTimeMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <motion.div
          key={metric.id}
          initial={{ scale: 1 }}
          animate={{ scale: isLive ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.5, repeat: isLive ? Infinity : 0, repeatDelay: 2 }}
        >
          <Card className="border-brand-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {metric.title.includes("Sessão") ? 
                      `${metric.value.toFixed(1)}min` : 
                      Math.floor(metric.value).toLocaleString()
                    }
                  </h3>
                  <div className={`flex items-center mt-2 text-sm ${
                    metric.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    <TrendingUp className={`h-4 w-4 mr-1 ${
                      metric.change >= 0 ? "" : "rotate-180"
                    }`} />
                    <span>{metric.change >= 0 ? "+" : ""}{metric.change.toFixed(1)}</span>
                  </div>
                </div>
                <div className={`h-10 w-10 rounded-full bg-${metric.color}-50 flex items-center justify-center`}>
                  <metric.icon className={`h-5 w-5 text-${metric.color}-500`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}