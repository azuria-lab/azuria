
import React from "react";

interface PriceVariation {
  name: string;
  price: number;
  margin: number;
  description: string;
  highlight?: boolean;
}

interface ProPriceVariationsProps {
  variations: PriceVariation[];
}

const ProPriceVariations: React.FC<ProPriceVariationsProps> = ({ variations }) => (
  <div className="bg-brand-50 p-4 rounded-lg shadow-sm">
    <h4 className="font-medium mb-4 text-brand-700">Simulação de Preços:</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {variations.map((variation) => (
        <div
          key={variation.name}
          className={`p-3 rounded-lg ${
            variation.highlight
              ? "bg-brand-100 border border-brand-200"
              : "bg-white border border-gray-200"
          }`}
        >
          <h5 className="font-medium text-sm mb-1 text-gray-700">{variation.name}</h5>
          <p className={`text-lg font-bold ${variation.highlight ? "text-brand-700" : "text-gray-800"}`}>
            R$ {variation.price.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Margem: {variation.margin.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {variation.description}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default ProPriceVariations;
