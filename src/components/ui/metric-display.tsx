import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * MetricDisplay — Composant Zeyna Design System
 * Affiche les métriques clés avec typographie JetBrains Mono.
 * Utilisé dans les dashboards pour les KPIs financiers et opérationnels.
 */

interface MetricDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Overline au-dessus de la valeur */
  label: string;
  /** La valeur principale */
  value: string | number;
  /** Unité affichée après la valeur */
  unit?: string;
  /** Description sous la valeur */
  description?: string;
  /** Variation par rapport à une période précédente (ex: +12%) */
  trend?: number;
  /** Taille du display */
  size?: "sm" | "md" | "lg" | "xl";
  /** Met la valeur en or Zeyna */
  highlighted?: boolean;
  /** Icône à gauche */
  icon?: React.ReactNode;
  /** Désactive la police mono (pour les valeurs textuelles) */
  noMono?: boolean;
}

export function MetricDisplay({
  label,
  value,
  unit,
  description,
  trend,
  size = "md",
  highlighted,
  icon,
  noMono,
  className,
  ...props
}: MetricDisplayProps) {
  const valueSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const TrendIcon =
    trend === undefined
      ? null
      : trend > 0
      ? TrendingUp
      : trend < 0
      ? TrendingDown
      : Minus;

  const trendColor =
    trend === undefined
      ? ""
      : trend > 0
      ? "text-malachite"
      : trend < 0
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <div className={cn("flex flex-col gap-0.5", className)} {...props}>
      {/* Overline label */}
      <span className="overline">{label}</span>

      {/* Valeur principale */}
      <div className="flex items-end gap-2">
        {icon && (
          <div className="pb-0.5 text-accent shrink-0">{icon}</div>
        )}
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "font-bold leading-none tracking-tight",
              valueSizes[size],
              noMono ? "font-ui" : "font-mono",
              highlighted ? "text-accent" : "text-foreground"
            )}
          >
            {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
          </span>
          {unit && (
            <span className="font-ui text-sm font-medium text-muted-foreground leading-none">
              {unit}
            </span>
          )}
        </div>

        {/* Trend indicator */}
        {TrendIcon && trend !== undefined && (
          <div className={cn("flex items-center gap-0.5 text-xs font-ui font-semibold pb-0.5", trendColor)}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
          {description}
        </span>
      )}
    </div>
  );
}
