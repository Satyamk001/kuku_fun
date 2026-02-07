import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

interface ConnectionErrorProps {
  error: string;
  onRetry?: () => void;
}

export function ConnectionError({ error, onRetry }: ConnectionErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md border-destructive/50 shadow-lg animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Connection Failed</CardTitle>
          <CardDescription>
            We couldn't connect to the chat server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted p-3 text-sm text-center font-mono text-muted-foreground break-all">
            {error}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button onClick={handleRetry} className="gap-2 min-w-[120px]">
             <RefreshCw className="h-4 w-4" />
             Retry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
