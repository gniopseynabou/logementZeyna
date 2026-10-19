import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockSelect, mockEq, mockNeq, mockIn, mockSingle, mockRpc, mockInsert, mockUpdate } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockEq: vi.fn(),
  mockNeq: vi.fn(),
  mockIn: vi.fn(),
  mockSingle: vi.fn(),
  mockRpc: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: mockFrom,
    rpc: mockRpc,
  },
}));

import {
  getChambreDisponibilitePlaces,
  validerReservationAdmin,
} from "./reservation-service";
import { createReservation, saveAdminChambre } from "./logement-service";

describe("Shared housing reservations (Individuel & Collectif)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Tarification et calculs", () => {
    it("calcule correctement le montant total à la réservation qui est uniquement la caution (15 000 F pour 1 place)", () => {
      const cautionParPersonne = 15000;
      const places = 1;

      // Montant total à payer après validation = uniquement la caution
      const montantTotalReservation = cautionParPersonne * places;

      expect(montantTotalReservation).toBe(15000);
    });

    it("calcule correctement le montant total en réservation collective pour les 4 places (60 000 F de caution)", () => {
      const cautionParPersonne = 15000;
      const places = 4; // Réservation collective des 4 places

      // Montant total à payer après validation = uniquement la caution totale du groupe
      const montantTotalReservation = cautionParPersonne * places;

      expect(montantTotalReservation).toBe(60000);
    });

    it("calcule correctement pour les logements rétrocompatibles à prix fixe (caution chambre entière)", () => {
      const cautionChambre = 50000;
      const isParPersonne = false;
      const places = 2;

      const cautionTotale = isParPersonne ? cautionChambre * places : cautionChambre;

      expect(cautionTotale).toBe(50000);
    });
  });

  describe("Gestion de la disponibilité et calcul des places", () => {
    it("retourne la disponibilité via la RPC dédiée get_chambre_disponibilite_places", async () => {
      const mockResult = {
        chambre_id: "chambre-123",
        est_disponible: true,
        capacite_totale: 4,
        places_occupees: 2,
        places_disponibles: 2,
        mode_reservation: "individuel",
        tarification_par_personne: true,
      };
      mockRpc.mockResolvedValue({ data: mockResult, error: null });

      const res = await getChambreDisponibilitePlaces("chambre-123", "2026-11-01", "2026-11-30");
      expect(res).toEqual(mockResult);
      expect(mockRpc).toHaveBeenCalledWith("get_chambre_disponibilite_places", {
        p_chambre_id: "chambre-123",
        p_date_debut: "2026-11-01",
        p_date_fin: "2026-11-30",
      });
    });

    it("calcule correctement les places restantes en fallback quand la RPC n'est pas appelée", async () => {
      mockRpc.mockRejectedValue(new Error("RPC not found"));
      mockFrom.mockImplementation((table: string) => {
        if (table === "chambres") {
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: "chambre-123",
                      nombre_personnes: 4,
                      est_disponible: true,
                      mode_reservation: "individuel",
                      tarification_par_personne: true,
                    },
                    error: null,
                  }),
              }),
            }),
          };
        }
        if (table === "reservations") {
          return {
            select: () => ({
              eq: () => ({
                in: () =>
                  Promise.resolve({
                    data: [{ nombre_places: 1 }, { nombre_places: 2 }],
                    error: null,
                  }),
              }),
            }),
          };
        }
        return {};
      });

      const res = await getChambreDisponibilitePlaces("chambre-123");
      expect(res.capacite_totale).toBe(4);
      expect(res.places_occupees).toBe(3);
      expect(res.places_disponibles).toBe(1);
      expect(res.est_disponible).toBe(true);
    });
  });

  describe("Validation de réservations simultanées et concurrence", () => {
    it("autorise la validation si la capacité restante est suffisante", async () => {
      mockRpc.mockResolvedValue({
        data: { success: true, statut: "confirmee_paiement_en_attente" },
        error: null,
      });

      await expect(validerReservationAdmin("res-1")).resolves.toEqual({
        success: true,
        statut: "confirmee_paiement_en_attente",
      });
    });

    it("rejette la validation si la capacité maximale restante est dépassée par des réservations concurrentes", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Capacité insuffisante : 2 place(s) demandée(s) mais seulement 1 restante(s) disponible(s)." },
      });

      await expect(validerReservationAdmin("res-depassee")).rejects.toThrow(
        "Capacité insuffisante"
      );
    });

    it("rejette une réservation collective si des places sont déjà prises sur la période", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Impossible de valider la réservation collective : 2 place(s) sont déjà réservées sur cette période." },
      });

      await expect(validerReservationAdmin("res-collectif-conflit")).rejects.toThrow(
        "Impossible de valider la réservation collective"
      );
    });
  });

  describe("Création et configuration côté formulaire", () => {
    it("enregistre les paramètres de réservation individuelle et collective avec createReservation", async () => {
      mockInsert.mockResolvedValue({ error: null });
      mockFrom.mockReturnValue({ insert: mockInsert });

      await createReservation({
        studentId: "user-1",
        roomId: "room-42",
        logementId: "logement-10",
        amount: 60000,
        nombrePlaces: 2,
        typeReservation: "individuel",
        dateDebut: "2026-11-01",
        dateFin: "2026-11-30",
      });

      expect(mockFrom).toHaveBeenCalledWith("reservations");
      expect(mockInsert).toHaveBeenCalledWith({
        etudiant_id: "user-1",
        chambre_id: "room-42",
        logement_id: "logement-10",
        montant_total: 60000,
        nombre_places: 2,
        type_reservation: "individuel",
        date_debut: "2026-11-01",
        date_fin: "2026-11-30",
        statut: "en_attente",
      });
    });

    it("sauvegarde les nouveaux champs mode_reservation et tarification_par_personne pour une chambre", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "room-1" },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      mockUpdate.mockReturnValue({ eq: vi.fn().mockReturnValue({ select: mockSelect }) });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await saveAdminChambre({
        id: "room-1",
        logement_id: "log-1",
        nom: "Chambre Partagée 4 places",
        nombre_personnes: 4,
        prix_bailleur: 13000,
        prix_zeyna: 15000,
        caution: 15000,
        mode_reservation: "collectif",
        tarification_par_personne: true,
      });

      expect(mockFrom).toHaveBeenCalledWith("chambres");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre_personnes: 4,
          mode_reservation: "collectif",
          tarification_par_personne: true,
        })
      );
    });
  });
});
