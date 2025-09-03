
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface GoalSimulatorProps {
  monthlyGoal: number;
  setMonthlyGoal: (goal: number) => void;
  profit: number;
  unitsForGoal: number;
}

export default function GoalSimulator({
  monthlyGoal,
  setMonthlyGoal,
  profit,
  unitsForGoal
}: GoalSimulatorProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h4 className="font-medium">Simulação de Meta de Lucro</h4>
      <div className="flex items-end gap-4">
        <div className="space-y-2 flex-1">
          <Label htmlFor="goal-input">Meta de lucro mensal (R$)</Label>
          <Input
            id="goal-input"
            type="number"
            min="100"
            step="100"
            value={monthlyGoal}
            onChange={(e) => setMonthlyGoal(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="border rounded-lg p-3 text-center min-w-[160px]">
          <p className="text-sm text-gray-600">Unidades necessárias</p>
          <p className="text-2xl font-bold text-brand-600">
            {unitsForGoal}
          </p>
          <p className="text-xs text-gray-500">para atingir a meta</p>
        </div>
      </div>
    </div>
  );
}
