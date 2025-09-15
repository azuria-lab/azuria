
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

interface ProfitSliderProps {
  targetProfit: number;
  onChange: (values: number[]) => void;
}

const ProfitSlider = ({ targetProfit, onChange }: ProfitSliderProps) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Label htmlFor="targetProfit" className="text-base">Margem de Lucro Desejada</Label>
      <motion.span
        key={targetProfit}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-lg font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-md"
      >
        {targetProfit}%
      </motion.span>
    </div>
    <Slider
      id="targetProfit"
      value={[targetProfit]}
      max={100}
      step={1}
      onValueChange={onChange}
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
);

export default ProfitSlider;
