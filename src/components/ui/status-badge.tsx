import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, Ban, ShieldCheck, AlertCircle } from "lucide-react";

/**
 * StatusBadge — Composant Zeyna Design System
 * Affiche les statuts métier de manière cohérente avec labels humains et icônes.
 * Remplace les affichages bruts de snake_case dans toute la plateforme.
 */

export type StatusVariant =
  | "confirmee"
  | "valide"
  | "disponible"
  | "en_attente"
  | "en_cours"
  | "annulee"
  | "rejete"
  | "complet"
  | "traite"
  | "info"
  | "neutre";

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  className: string;
  dotClassName: string;
  pulse?: boolean;
}

const STATUS_CONFIGS: Record<StatusVariant, StatusConfig> = {
  confirmee: {
    label: "Confirmée",
    icon: CheckCircle2,
    className:
      "bg-malachite-light text-malachite dark:bg-malachite/15 dark:text-malachite-dark border-malachite/20",
    dotClassName: "bg-malachite",
    pulse: false,
  },
  valide: {
    label: "Validé",
    icon: ShieldCheck,
    className:
      "bg-malachite-light text-malachite dark:bg-malachite/15 dark:text-malachite-dark border-malachite/20",
    dotClassName: "bg-malachite",
    pulse: false,
  },
  disponible: {
    label: "Disponible",
    icon: CheckCircle2,
    className:
      "bg-malachite-light text-malachite dark:bg-malachite/15 dark:text-malachite-dark border-malachite/20",
    dotClassName: "bg-malachite",
    pulse: true,
  },
  traite: {
    label: "Versé",
    icon: CheckCircle2,
    className:
      "bg-malachite-light text-malachite dark:bg-malachite/15 dark:text-malachite-dark border-malachite/20",
    dotClassName: "bg-malachite",
    pulse: false,
  },
  en_attente: {
    label: "En attente",
    icon: Clock,
    className:
      "bg-warning-light text-warning dark:bg-warning/15 dark:text-amber-400 border-warning/20",
    dotClassName: "bg-warning",
    pulse: true,
  },
  en_cours: {
    label: "En cours",
    icon: Clock,
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200/50",
    dotClassName: "bg-blue-500",
    pulse: true,
  },
  annulee: {
    label: "Annulée",
    icon: XCircle,
    className:
      "bg-destructive/8 text-destructive dark:bg-destructive/15 border-destructive/20",
    dotClassName: "bg-destructive",
    pulse: false,
  },
  rejete: {
    label: "Rejeté",
    icon: XCircle,
    className:
      "bg-destructive/8 text-destructive dark:bg-destructive/15 border-destructive/20",
    dotClassName: "bg-destructive",
    pulse: false,
  },
  complet: {
    label: "Complet",
    icon: Ban,
    className:
      "bg-muted text-muted-foreground border-border",
    dotClassName: "bg-muted-foreground",
    pulse: false,
  },
  info: {
    label: "Info",
    icon: AlertCircle,
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200/50",
    dotClassName: "bg-blue-500",
    pulse: false,
  },
  neutre: {
    label: "—",
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground border-border",
    dotClassName: "bg-muted-foreground",
    pulse: false,
  },
};

/** Tente de mapper une chaîne brute vers un StatusVariant */
export function resolveStatus(raw: string | null | undefined): StatusVariant {
  if (!raw) return "neutre";
  const map: Record<string, StatusVariant> = {
    confirmee: "confirmee",
    confirmée: "confirmee",
    confirmed: "confirmee",
    valide: "valide",
    validé: "valide",
    validated: "valide",
    disponible: "disponible",
    available: "disponible",
    en_attente: "en_attente",
    en_attente_de_paiement: "en_attente",
    pending: "en_attente",
    en_cours: "en_cours",
    in_progress: "en_cours",
    annulee: "annulee",
    annulée: "annulee",
    cancelled: "annulee",
    rejete: "rejete",
    rejeté: "rejete",
    rejected: "rejete",
    complet: "complet",
    complet_full: "complet",
    full: "complet",
    traite: "traite",
    traité: "traite",
    processed: "traite",
  };
  return map[raw.toLowerCase().trim()] ?? "neutre";
}

interface StatusBadgeProps {
  status: StatusVariant | string;
  /** Écrase le label par défaut */
  label?: string;
  /** Affiche l'icône */
  showIcon?: boolean;
  /** Affiche le point de statut */
  showDot?: boolean;
  /** Taille du badge */
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status,
  label,
  showIcon = false,
  showDot = true,
  size = "sm",
  className,
}: StatusBadgeProps) {
  const variant = resolveStatus(status as string);
  const config = STATUS_CONFIGS[variant];
  const Icon = config.icon;

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-ui font-semibold uppercase tracking-wider rounded-sm border",
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full shrink-0",
            size === "xs" ? "w-1 h-1" : "w-1.5 h-1.5",
            config.dotClassName,
            config.pulse && "animate-pulse-or"
          )}
        />
      )}
      {showIcon && (
        <Icon
          className={cn(
            "shrink-0",
            size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3"
          )}
        />
      )}
      {label ?? config.label}
    </span>
  );
}
