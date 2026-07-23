import { Button } from "@/components/ui/button";
import { LucideAlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  message,
  onRetry,
}: ErrorStateProps) {

  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">

      <LucideAlertCircle className="h-8 w-8 text-destructive" />

      <p className="text-sm text-muted-foreground">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}

    </div>
  );
}