import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calculator } from "lucide-react";

interface UsageLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used: number;
  limit: number;
  onUpgrade: () => void;
}

export const UsageLimitDialog = ({
  open,
  onOpenChange,
  used,
  limit,
  onUpgrade,
}: UsageLimitDialogProps) => {
  const safeLimit = Number.isFinite(limit) ? limit : used;
  const percent = safeLimit > 0 ? Math.min((used / safeLimit) * 100, 100) : 100;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-3 text-left">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Calculator className="h-6 w-6" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-center">
            Limite diário atingido 🚀
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-center text-muted-foreground">
            O plano FREE permite até {safeLimit} cálculos por dia. Faça upgrade para o plano PRO e destrave cálculos ilimitados, relatórios avançados e muito mais.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-medium">
            <span>Uso diário</span>
            <span>{used}/{safeLimit}</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>

        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
          <AlertDialogAction asChild>
            <Button className="w-full" onClick={onUpgrade}>
              Ver planos PRO
            </Button>
          </AlertDialogAction>
          <AlertDialogCancel className="w-full">
            Continuar no plano FREE
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
