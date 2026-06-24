import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 p-8">
          <h2 className="font-serif text-xl font-bold text-foreground">Une erreur est survenue</h2>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            {this.state.error?.message || "Erreur inattendue"}
          </p>
          <Button onClick={() => this.setState({ hasError: false })} variant="outline">
            Réessayer
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
