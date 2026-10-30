import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton — Composant Zeyna Design System
 * États de chargement shimmer cohérents avec la structure réelle.
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hauteur fixe */
  height?: number | string;
  /** Largeur */
  width?: number | string;
}

export function Skeleton({ className, height, width, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      style={{ height, width, ...style }}
      {...props}
    />
  );
}

// Preset skeletons pour les composants récurrents

export function SkeletonCard() {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-premium">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-sm" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
        {[40, 80, 60, 50, 40].map((w, i) => (
          <Skeleton key={i} className="h-2.5" style={{ width: `${w}px` }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonLogementCard() {
  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-5">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-3 w-32 mb-5" />
        <div className="flex items-end justify-between pt-4 border-t border-border">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </div>
  );
}
