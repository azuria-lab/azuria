
import React from "react";
import { Card } from "@/components/ui/card";
import { CircleDollarSign, Percent, TrendingDown, TrendingUp } from "lucide-react";

export default function MetricsSummary() {
  // Dados mockados para demonstração
  const metrics = [
    {
      title: "Margem Média",
      value: "42%",
      change: "+3.5%",
      trend: "up",
      color: "blue"
    },
    {
      title: "Lucro Médio",
      value: "R$ 35,70",
      change: "+5.2%",
      trend: "up",
      color: "green"
    },
    {
      title: "Taxa Média",
      value: "8.5%",
      change: "-1.2%",
      trend: "down",
      color: "amber"
    },
    {
      title: "Produto Mais Lucrativo",
      value: "R$ 127,50",
      secondaryText: "Produto A",
      color: "purple"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {metrics.map((metric) => (
        <Card key={metric.title} className="border-brand-100">
          <div className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
                {metric.secondaryText && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.secondaryText}
                  </p>
                )}
              </div>
              <div className={`h-8 w-8 rounded-full bg-${metric.color}-50 flex items-center justify-center`}>
                {metric.color === "blue" && <Percent className={`h-4 w-4 text-${metric.color}-500`} />}
                {metric.color === "green" && <CircleDollarSign className={`h-4 w-4 text-${metric.color}-500`} />}
                {metric.color === "amber" && <Percent className={`h-4 w-4 text-${metric.color}-500`} />}
                {metric.color === "purple" && <CircleDollarSign className={`h-4 w-4 text-${metric.color}-500`} />}
              </div>
            </div>
            
            {metric.change && (
              <div className={`flex items-center mt-3 text-sm text-${metric.trend === "up" ? "green" : "red"}-600`}>
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{metric.change} vs. período anterior</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
