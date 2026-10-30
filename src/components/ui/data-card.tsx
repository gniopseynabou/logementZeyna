import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DataCard — Composant Zeyna Design System
 * Remplace les Card Shadcn standard dans les dashboards.
 * Style institutionnel : sobre, lisible, signature Zeyna.
 */

// ── DataCard Root ────────────────────────────────────────────────────────────

interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Affiche la ligne or en haut */
  accentTop?: boolean;
  /** Affiche la ligne or à gauche */
  accentLeft?: boolean;
  /** Rend la carte cliquable (hover effect renforcé) */
  interactive?: boolean;
  /** Supprime le padding interne (pour les listes de lignes) */
  noPadding?: boolean;
}

const DataCard = React.forwardRef<HTMLDivElement, DataCardProps>(
  (
    { className, accentTop, accentLeft, interactive, noPadding, children, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-card",
        "shadow-premium",
        interactive &&
          "cursor-pointer transition-premium hover:shadow-elevated hover:border-accent/30",
        accentTop && "accent-line-top",
        accentLeft && "accent-line-left",
        !noPadding && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DataCard.displayName = "DataCard";

// ── DataCard Header ─────────────────────────────────────────────────────────

interface DataCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Affiche un séparateur bas */
  separator?: boolean;
}

const DataCardHeader = React.forwardRef<HTMLDivElement, DataCardHeaderProps>(
  ({ className, separator, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-3",
        separator && "pb-4 mb-4 border-b border-border/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DataCardHeader.displayName = "DataCardHeader";

// ── DataCard Title ──────────────────────────────────────────────────────────

const DataCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-serif text-base font-semibold text-foreground leading-snug", className)}
    {...props}
  >
    {children}
  </h3>
));
DataCardTitle.displayName = "DataCardTitle";

// ── DataCard Overline ───────────────────────────────────────────────────────

const DataCardOverline = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("overline block mb-1", className)}
    {...props}
  >
    {children}
  </span>
));
DataCardOverline.displayName = "DataCardOverline";

// ── DataCard Content ─────────────────────────────────────────────────────────

const DataCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
DataCardContent.displayName = "DataCardContent";

// ── DataCard Footer ──────────────────────────────────────────────────────────

const DataCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between pt-4 mt-4 border-t border-border/60", className)}
      {...props}
    />
  )
);
DataCardFooter.displayName = "DataCardFooter";

export {
  DataCard,
  DataCardHeader,
  DataCardTitle,
  DataCardOverline,
  DataCardContent,
  DataCardFooter,
};
