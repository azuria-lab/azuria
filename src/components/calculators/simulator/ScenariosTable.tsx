
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Scenario {
  name: string;
  multiplier: number;
  volume: number;
}

interface ScenariosTableProps {
  scenarios: Scenario[];
  sellingPrice: number;
  profit: number;
  formatCurrency: (value: number) => string;
}

export default function ScenariosTable({ 
  scenarios, 
  sellingPrice, 
  profit, 
  formatCurrency 
}: ScenariosTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cenário</TableHead>
            <TableHead className="text-right">Unidades</TableHead>
            <TableHead className="text-right">Faturamento</TableHead>
            <TableHead className="text-right">Lucro Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenarios.map((scenario) => (
            <TableRow key={scenario.name}>
              <TableCell>{scenario.name}</TableCell>
              <TableCell className="text-right">{scenario.volume}</TableCell>
              <TableCell className="text-right">
                R$ {formatCurrency(scenario.volume * sellingPrice)}
              </TableCell>
              <TableCell className="text-right">
                R$ {formatCurrency(scenario.volume * profit)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
