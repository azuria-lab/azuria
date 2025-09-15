
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Star } from "lucide-react";

interface Competitor {
  id: string;
  store: string;
  price: number;
  marketplace: string;
  productUrl: string;
  productType: "Original" | "Similar" | "Genérico";
  isCheapest?: boolean;
  isRecommended?: boolean;
}

interface CompetitorsListProps {
  competitors: Competitor[];
}

export default function CompetitorsList({ competitors }: CompetitorsListProps) {
  const getBadgeVariant = (productType: string) => {
    switch (productType) {
      case "Original":
        return "default";
      case "Similar":
        return "secondary";
      case "Genérico":
        return "outline";
      default:
        return "outline";
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marketplace</TableHead>
            <TableHead>Loja</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {competitors.map((competitor) => (
            <TableRow key={competitor.id}>
              <TableCell className="font-medium">
                {competitor.marketplace}
              </TableCell>
              <TableCell>{competitor.store}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(competitor.productType)}>
                  {competitor.productType}
                </Badge>
                {competitor.isCheapest && (
                  <Badge variant="destructive" className="ml-2">
                    Mais Barato
                  </Badge>
                )}
                {competitor.isRecommended && (
                  <Badge variant="default" className="ml-2 bg-green-500">
                    <Star className="mr-1 h-3 w-3" />
                    Recomendado
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold">
                R$ {competitor.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <a href={competitor.productUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Ver Anúncio
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
