
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface Marketplace {
  id: string;
  name: string;
  fee: number;
}

interface MarketplaceSelectorProps {
  marketplace: string;
  onChange: (value: string) => void;
  marketplaces: Marketplace[];
}

const MarketplaceSelector = ({ marketplace, onChange, marketplaces }: MarketplaceSelectorProps) => (
  <div className="space-y-2">
    <Label htmlFor="marketplace" className="text-base">Marketplace</Label>
    <Select
      value={marketplace}
      onValueChange={onChange}
    >
      <SelectTrigger id="marketplace" className="transition-all focus:ring-2 focus:ring-brand-400">
        <SelectValue placeholder="Selecione um marketplace" />
      </SelectTrigger>
      <SelectContent>
        {marketplaces.map((mp) => (
          <SelectItem key={mp.id} value={mp.id}>
            {mp.name} ({mp.fee}%)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default MarketplaceSelector;
