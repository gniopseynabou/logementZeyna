import type { QueryClient } from "@tanstack/react-query";
import type { INVALIDATION_GROUPS } from "./query-keys";

type GroupKey = keyof typeof INVALIDATION_GROUPS;

/**
 * Invalide en une seule fois tous les caches d'un groupe métier.
 * 
 * @example
 * // Après validation d'un logement :
 * await invalidateGroup(queryClient, "LOGEMENT_CHANGED");
 * 
 * // Après une réservation + paiement :
 * await invalidateGroups(queryClient, ["RESERVATION_CHANGED", "PAIEMENT_CHANGED"]);
 */
export const invalidateGroup = async (
  qc: QueryClient,
  group: GroupKey
): Promise<void> => {
  const { INVALIDATION_GROUPS } = await import("./query-keys");
  const keys = INVALIDATION_GROUPS[group];
  await Promise.all(
    keys.map((key) => qc.invalidateQueries({ queryKey: key as string[] }))
  );
};

export const invalidateGroups = async (
  qc: QueryClient,
  groups: GroupKey[]
): Promise<void> => {
  await Promise.all(groups.map((g) => invalidateGroup(qc, g)));
};

/**
 * Invalide toutes les queries d'un utilisateur étudiant.
 * À appeler après une action qui affecte les données d'un étudiant.
 */
export const invalidateEtudiantData = async (
  qc: QueryClient,
  userId: string
): Promise<void> => {
  const { QUERY_KEYS } = await import("./query-keys");
  await Promise.all([
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ETUDIANT_RESERVATIONS(userId) }),
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ETUDIANT_RESERVATIONS_FULL(userId) }),
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ETUDIANT_PAIEMENTS(userId) }),
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ETUDIANT_PAIEMENTS_FULL(userId) }),
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ETUDIANT_CONTRATS(userId) }),
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ETUDIANT_INCIDENTS(userId) }),
  ]);
};

/**
 * Invalide toutes les queries d'un bailleur spécifique.
 */
export const invalidateBailleurData = async (
  qc: QueryClient,
  userId: string
): Promise<void> => {
  const { QUERY_KEYS } = await import("./query-keys");
  await Promise.all([
    qc.invalidateQueries({ queryKey: QUERY_KEYS.BAILLEUR_LOGEMENTS(userId) }),
    qc.invalidateQueries({ queryKey: QUERY_KEYS.BAILLEUR_LOGEMENTS_LIST(userId) }),
    qc.invalidateQueries({ queryKey: QUERY_KEYS.BAILLEUR_PAIEMENTS(userId) }),
    qc.invalidateQueries({ queryKey: QUERY_KEYS.BAILLEUR_REVERSEMENTS(userId) }),
  ]);
};
