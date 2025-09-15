
import { useEffect, useState } from "react";

interface Competitor {
  name: string;
  price: number;
  difference: number;
}

export function useCompetitors(sellingPrice: number | null) {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { name: "Competidor A", price: 0, difference: 0 },
    { name: "Competidor B", price: 0, difference: 0 }
  ]);

  // Update competitor differences when selling price changes
  useEffect(() => {
    if (sellingPrice) {
      setCompetitors(prev => prev.map(comp => ({
        ...comp,
        difference: sellingPrice - comp.price
      })));
    }
  }, [sellingPrice]);

  // Function to update competitor price
  const updateCompetitor = (index: number, price: number) => {
    if (!sellingPrice) {return;}
    
    const updatedCompetitors = [...competitors];
    updatedCompetitors[index].price = price;
    updatedCompetitors[index].difference = sellingPrice - price;
    setCompetitors(updatedCompetitors);
  };

  return {
    competitors,
    updateCompetitor
  };
}
