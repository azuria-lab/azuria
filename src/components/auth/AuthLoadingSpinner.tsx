import { Loader2 } from "lucide-react";

interface AuthLoadingSpinnerProps {
  message?: string;
}

export const AuthLoadingSpinner: React.FC<AuthLoadingSpinnerProps> = ({ 
  message = "Carregando..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};