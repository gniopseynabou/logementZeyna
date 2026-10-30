import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * ThemeToggle — Composant Zeyna Design System
 * Toggle dark/light mode. Intégré dans le header du dashboard et la navbar publique.
 */

interface ThemeToggleProps {
  className?: string;
  /** Compact : icône seule. Default : icône + label */
  compact?: boolean;
}

export function ThemeToggle({ className, compact = true }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 border border-border/80",
        "text-foreground/80 hover:text-foreground hover:bg-muted bg-card/60",
        "transition-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-accent transition-premium" />
      ) : (
        <Moon className="h-4 w-4 text-foreground/80 transition-premium" />
      )}
      {!compact && (
        <span className="font-ui text-xs font-semibold">
          {isDark ? "Clair" : "Sombre"}
        </span>
      )}
    </button>
  );
}
