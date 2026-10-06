import { useEffect } from "react";
import { Wrench, Clock } from "lucide-react";
import { useMaintenance } from "@/hooks/useMaintenance";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import logo from "@/assets/logo-zeyna.png";

/**
 * Page affichée aux utilisateurs standards pendant le mode maintenance.
 * Le Super-Admin bypass ce composant via MaintenanceGuard.
 * Aucune information technique n'est exposée.
 */
const MaintenancePage = () => {
  const { data: maintenance } = useMaintenance();

  // Définir le statut HTTP 503 via meta pour les crawlers
  useEffect(() => {
    document.title = "Maintenance en cours — Les Logements de Zeyna";
  }, []);

  const title = maintenance?.title ?? "Maintenance en cours";
  const message =
    maintenance?.message ??
    "La plateforme est temporairement indisponible pour une opération de maintenance. Nous serons de retour très prochainement.";
  const scheduledEnd = maintenance?.scheduled_end;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={logo}
            alt="Les Logements de Zeyna"
            className="h-16 w-16 object-contain drop-shadow-md"
          />
        </div>

        {/* Icône maintenance */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
            <Wrench className="h-10 w-10 text-amber-600 animate-pulse" />
          </div>
        </div>

        {/* Titre et message */}
        <div className="space-y-3">
          <h1 className="font-serif text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground leading-relaxed">{message}</p>
        </div>

        {/* Date de retour prévue */}
        {scheduledEnd && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              Retour prévu :{" "}
              <span className="font-medium text-foreground">
                {format(new Date(scheduledEnd), "dd MMMM yyyy à HH:mm", { locale: fr })}
              </span>
            </span>
          </div>
        )}

        {/* Séparateur */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Les Logements de Zeyna — Plateforme de logement étudiant
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
