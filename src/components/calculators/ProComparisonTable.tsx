
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";

interface CompetitorData {
  name: string;
  price: number;
  difference: number;
  url?: string;
}

interface ProComparisonTableProps {
  sellingPrice: number | null;
  competitors: CompetitorData[];
  formatCurrency: (value: number) => string;
}

export default function ProComparisonTable({
  sellingPrice,
  competitors,
  formatCurrency,
}: ProComparisonTableProps) {
  if (!sellingPrice || competitors.length === 0) {return null;}

  const sortedCompetitors = [...competitors].sort((a, b) => a.price - b.price);
  
  return (
    <div className="mt-5 border rounded-lg overflow-hidden">
      <h4 className="p-3 bg-brand-50 font-medium border-b">
        Comparação com concorrentes
      </h4>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Diferença</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCompetitors.map((competitor, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {competitor.url ? (
                    <a
                      href={competitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {competitor.name}
                    </a>
                  ) : (
                    competitor.name
                  )}
                </TableCell>
                <TableCell>R$ {formatCurrency(competitor.price)}</TableCell>
                <TableCell className={competitor.difference < 0 ? "text-red-500" : "text-green-500"}>
                  {competitor.difference > 0 ? "+" : ""}
                  R$ {formatCurrency(Math.abs(competitor.difference))}
                </TableCell>
                <TableCell className="text-right">
                  {competitor.price < sellingPrice ? (
                    <span className="inline-flex items-center text-amber-600 gap-1">
                      <XCircle className="h-4 w-4" />
                      <span className="text-xs">Mais barato</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-green-600 gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">Preço competitivo</span>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-brand-50 font-medium">
              <TableCell>Seu preço</TableCell>
              <TableCell>R$ {formatCurrency(sellingPrice)}</TableCell>
              <TableCell>-</TableCell>
              <TableCell className="text-right">-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
