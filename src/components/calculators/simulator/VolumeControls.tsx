
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VolumeControlsProps {
  salesVolume: number;
  setSalesVolume: (volume: number) => void;
}

export default function VolumeControls({ salesVolume, setSalesVolume }: VolumeControlsProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="volume-input">Volume de Vendas (unidades)</Label>
        <div className="text-sm text-brand-700 font-medium">
          {salesVolume} {salesVolume === 1 ? "unidade" : "unidades"}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Slider
          id="volume-slider"
          min={1}
          max={100}
          step={1}
          value={[salesVolume]}
          onValueChange={(values) => setSalesVolume(values[0])}
          className="flex-1"
        />
        <Input
          id="volume-input"
          type="number"
          min={1}
          value={salesVolume}
          onChange={(e) => setSalesVolume(Number(e.target.value))}
          className="w-20"
        />
      </div>
    </div>
  );
}
