
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";

export default function IntelligenceFooter() {
  return (
    <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="pt-6">
        <div className="text-center">
          <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-purple-800 mb-2">
            Powered by Inteligência Artificial
          </h3>
          <p className="text-purple-700 text-sm max-w-2xl mx-auto">
            Nossos algoritmos de Machine Learning analisam milhões de pontos de dados em tempo real 
            para fornecer insights precisos e recomendações personalizadas para o seu negócio.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600">2.5M+</p>
              <p className="text-xs text-purple-600">Produtos analisados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">94%</p>
              <p className="text-xs text-purple-600">Precisão das previsões</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">24/7</p>
              <p className="text-xs text-purple-600">Monitoramento contínuo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">+32%</p>
              <p className="text-xs text-purple-600">Aumento médio de lucro</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
