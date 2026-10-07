/**
 * Registre centralisé de tous les QueryKeys de l'application.
 * Utiliser ces constantes partout pour garantir la cohérence
 * et permettre une invalidation ciblée et complète.
 */

export const QUERY_KEYS = {
  // ─── Landing / Public ───────────────────────────────────────
  HERO_STATS:          ["hero-live-stats"],
  POPULAR_LOGEMENTS:   ["popular-logements"],
  PUBLIC_LOGEMENTS:    ["logements-list"],
  LOGEMENT_DETAIL:     (id: string) => ["logement-detail", id],
  FAQS:                ["faqs"],
  TEMOIGNAGES:         ["temoignages"],

  // ─── Admin ───────────────────────────────────────────────────
  ADMIN_STATS:         ["admin-stats"],
  ADMIN_LOGEMENTS:     ["admin-all-logements"],
  ADMIN_BAILLEURS:     ["admin-bailleurs"],
  ADMIN_RESERVATIONS:  ["admin-reservations"],
  ADMIN_PAIEMENTS:     ["admin-paiements"],
  ADMIN_USERS:         ["admin-all-users"],
  ADMIN_INCIDENTS:     ["admin-incidents"],
  ADMIN_TARIFS:        ["admin-tarifs-logements"],
  ADMIN_CONTRATS:      ["admin-all-contrats"],
  ADMIN_LOGEMENTS_BAILLEURS: ["admin-logements-bailleurs"],
  ADMIN_REVERSEMENTS:  ["reversements-estimes"],

  // ─── Bailleur ────────────────────────────────────────────────
  BAILLEUR_LOGEMENTS:        (userId: string) => ["bailleur-logements", userId],
  BAILLEUR_LOGEMENTS_LIST:   (userId: string) => ["bailleur-logements-list", userId],
  BAILLEUR_PAIEMENTS:        (userId: string) => ["bailleur-paiements-detail", userId],
  BAILLEUR_REVERSEMENTS:     (userId: string) => ["bailleur-reversements", userId],

  // ─── Étudiant ────────────────────────────────────────────────
  ETUDIANT_RESERVATIONS:     (userId: string) => ["etudiant-reservations", userId],
  ETUDIANT_RESERVATIONS_FULL:(userId: string) => ["etudiant-reservations-full", userId],
  ETUDIANT_PAIEMENTS:        (userId: string) => ["etudiant-paiements", userId],
  ETUDIANT_PAIEMENTS_FULL:   (userId: string) => ["etudiant-paiements-full", userId],
  ETUDIANT_CONTRATS:         (userId: string) => ["etudiant-contrats", userId],
  ETUDIANT_INCIDENTS:        (userId: string) => ["etudiant-incidents", userId],
  RESERVATION_PAIEMENT:      (reservationId: string) => ["reservation-paiement", reservationId],
} as const;

/**
 * Groupes d'invalidation - listes de queryKeys à invalider ensemble
 * selon le type d'action métier effectué.
 */
export const INVALIDATION_GROUPS = {
  /**
   * Quand un logement est créé, modifié ou son statut change :
   * tout ce qui affiche des logements doit se rafraîchir.
   */
  LOGEMENT_CHANGED: [
    QUERY_KEYS.ADMIN_LOGEMENTS,
    QUERY_KEYS.ADMIN_STATS,
    QUERY_KEYS.PUBLIC_LOGEMENTS,
    QUERY_KEYS.POPULAR_LOGEMENTS,
    QUERY_KEYS.HERO_STATS,
    QUERY_KEYS.ADMIN_LOGEMENTS_BAILLEURS,
    QUERY_KEYS.ADMIN_TARIFS,
  ],

  /**
   * Quand une réservation est créée, confirmée ou annulée.
   */
  RESERVATION_CHANGED: [
    QUERY_KEYS.ADMIN_RESERVATIONS,
    QUERY_KEYS.ADMIN_STATS,
    QUERY_KEYS.ADMIN_PAIEMENTS,
    QUERY_KEYS.HERO_STATS,
  ],

  /**
   * Quand un paiement est effectué ou modifié.
   */
  PAIEMENT_CHANGED: [
    QUERY_KEYS.ADMIN_PAIEMENTS,
    QUERY_KEYS.ADMIN_REVERSEMENTS,
    QUERY_KEYS.ADMIN_STATS,
  ],

  /**
   * Quand un bailleur est validé, invalidé ou invité.
   */
  BAILLEUR_CHANGED: [
    QUERY_KEYS.ADMIN_BAILLEURS,
    QUERY_KEYS.ADMIN_USERS,
    QUERY_KEYS.ADMIN_STATS,
  ],

  /**
   * Quand un incident est créé ou mis à jour.
   */
  INCIDENT_CHANGED: [
    QUERY_KEYS.ADMIN_INCIDENTS,
    QUERY_KEYS.ADMIN_STATS,
  ],

  /**
   * Quand un contrat est généré ou signé.
   */
  CONTRAT_CHANGED: [
    QUERY_KEYS.ADMIN_CONTRATS,
    QUERY_KEYS.ADMIN_STATS,
  ],
} as const;
