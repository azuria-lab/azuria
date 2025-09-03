
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Percent } from "lucide-react";
import { motion } from "framer-motion";

interface MarginSectionProps {
  margin: number;
  onMarginChange: (values: number[]) => void;
}

export default function MarginSection({
  margin,
  onMarginChange
}: MarginSectionProps) {
  return (
    <div className="space-y-5 mb-6">
      <h3 className="text-sm font-medium flex items-center gap-1.5 text-brand-700 border-b pb-1.5">
        <Percent className="h-4 w-4" /> Margem de Lucro
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="margin" className="flex items-center gap-1.5">
            <Percent className="h-4 w-4" /> Margem de Lucro
          </Label>
          <motion.span 
            key={margin}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-lg font-medium text-brand-700 bg-brand-50 px-2 py-1 rounded-md"
          >
            {margin}%
          </motion.span>
        </div>
        <Slider
          id="margin"
          defaultValue={[margin]}
          value={[margin]}
          max={100}
          step={1}
          onValueChange={onMarginChange}
          className="my-4"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
