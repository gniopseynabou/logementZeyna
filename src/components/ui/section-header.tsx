import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SectionHeader — Composant Zeyna Design System
 * En-tête cohérent pour les sections de page dans les dashboards.
 * Remplace les patterns ad-hoc div/h1/p répandus dans tout le projet.
 */

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Titre de section (peut être un ReactNode pour des styles custom) */
  title: React.ReactNode;
  /** Sous-titre descriptif */
  subtitle?: React.ReactNode;
  /** Actions à droite (boutons, liens) */
  actions?: React.ReactNode;
  /** Overline au-dessus du titre */
  overline?: string;
  /** Ajoute un séparateur bas */
  separator?: boolean;
  /** Taille du titre */
  titleSize?: "sm" | "md" | "lg";
}

export function SectionHeader({
  title,
  subtitle,
  actions,
  overline,
  separator,
  titleSize = "md",
  className,
  ...props
}: SectionHeaderProps) {
  const titleSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between gap-4",
        separator && "pb-5 border-b border-border/60",
        className
      )}
      {...props}
    >
      <div>
        {overline && <span className="overline block mb-1">{overline}</span>}
        <h1
          className={cn(
            "font-serif font-semibold text-foreground tracking-tight",
            titleSizes[titleSize]
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
