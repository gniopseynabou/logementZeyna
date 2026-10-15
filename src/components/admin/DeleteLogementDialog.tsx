import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteAdminLogement } from "@/services/logement-service";
import { invalidateGroup } from "@/lib/invalidate-helpers";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteLogementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logement: {
    id: string;
    nom: string;
    chambres?: Array<{ id: string; nom: string }>;
  } | null;
  onDeleted?: () => void;
}

export const DeleteLogementDialog = ({
  open,
  onOpenChange,
  logement,
  onDeleted,
}: DeleteLogementDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  if (!logement) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteAdminLogement(logement.id);
      await invalidateGroup(qc, "LOGEMENT_CHANGED");

      toast({
        title: "Logement supprimé avec succès ✅",
        description: `Le logement "${logement.nom}" et ses chambres associées ont été supprimés.`,
      });

      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast({
        title: "Erreur lors de la suppression",
        description: error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const countChambres = logement.chambres?.length || 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:max-w-md rounded-2xl p-5 sm:p-6">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <AlertDialogTitle className="text-base sm:text-lg">Supprimer ce logement ?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p>
              Êtes-vous sûr de vouloir supprimer définitivement le logement{" "}
              <strong className="text-foreground">« {logement.nom} »</strong> ?
            </p>
            {countChambres > 0 && (
              <p className="bg-destructive/10 text-destructive p-2.5 rounded-lg text-xs font-medium">
                ⚠️ Attention : cette action supprimera également les {countChambres} chambre(s)
                associée(s). Les réservations liées seront également impactées.
              </p>
            )}
            <p className="text-xs">Cette action est irréversible.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4 sm:mt-0">
          <AlertDialogCancel disabled={loading} className="w-full sm:w-auto">Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2 w-full sm:w-auto"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
