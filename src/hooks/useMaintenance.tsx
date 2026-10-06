import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MaintenanceConfig {
  id: string;
  is_active: boolean;
  title: string;
  message: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  activated_by: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToggleMaintenanceInput {
  is_active: boolean;
  title?: string;
  message?: string;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
}

/**
 * Récupère le statut de maintenance depuis Supabase.
 * Accessible à tous (policy "Anyone can read maintenance status").
 */
export const getMaintenanceStatus = async (): Promise<MaintenanceConfig | null> => {
  const { data, error } = await supabase
    .from("maintenance_config")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Hook pour lire le statut de maintenance.
 * Rafraîchit toutes les 60 secondes pour détecter les changements.
 */
export const useMaintenance = () => {
  return useQuery({
    queryKey: ["maintenance-status"],
    queryFn: getMaintenanceStatus,
    staleTime: 30 * 1000,       // 30 secondes
    refetchInterval: 60 * 1000, // Poll toutes les 60 secondes
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook pour activer/désactiver le mode maintenance.
 * Réservé au super_admin (vérification backend dans l'Edge Function).
 */
export const useToggleMaintenance = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: ToggleMaintenanceInput) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expirée, veuillez vous reconnecter.");

      const { data, error } = await supabase.functions.invoke("toggle-maintenance", {
        body: input,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["maintenance-status"] });
    },
  });
};
