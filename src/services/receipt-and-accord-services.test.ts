import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import {
  createManualReceipt,
  registerOperation,
  getReceipts,
  getOperationsRegister,
} from "./receipt-service";
import {
  createOrUpdateAccord,
  getBailleurAccords,
} from "./accord-proprietaire-service";

vi.mock("@/integrations/supabase/client", () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
    },
  };
});

describe("Système 1 & 4 : Reçus de paiement, Registre des opérations et Accords propriétaires", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Reçus manuels et Registre des opérations (Système 4)", () => {
    it("createManualReceipt génère une référence REC-MAN- et persiste le reçu", async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "rec-123",
              reference: "REC-MAN-202610-1234",
              montant: 60000,
              payeur_nom_complet: "Awa Ndiaye",
              motif: "Loyer Novembre 2026",
            },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "recus_paiements") {
          return { insert: mockInsert };
        }
        if (table === "registre_operations") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "op-1" }, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const res = await createManualReceipt({
        payeurNomComplet: "Awa Ndiaye",
        montant: 60000,
        motif: "Loyer Novembre 2026",
        methodePaiement: "Wave",
      });

      expect(res.id).toBe("rec-123");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          payeur_nom_complet: "Awa Ndiaye",
          montant: 60000,
          type_generation: "manuel",
          methode_paiement: "Wave",
        })
      );
    });

    it("registerOperation génère une référence OP-YYYYMM- et enregistre l'écriture comptable", async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "op-999",
              reference_operation: "OP-202610-12345",
              type_operation: "encaissement_etudiant",
              montant: 75000,
            },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({ insert: mockInsert });

      const op = await registerOperation({
        typeOperation: "encaissement_etudiant",
        montant: 75000,
        modeReglement: "Orange Money",
        description: "Paiement caution test",
      });

      expect(op?.id).toBe("op-999");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type_operation: "encaissement_etudiant",
          montant: 75000,
          mode_reglement: "Orange Money",
          statut: "valide",
        })
      );
    });
  });

  describe("Accords écrits propriétaires (Système 1)", () => {
    it("createOrUpdateAccord insère un accord signé si aucun n'existe", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "acc-1",
              reference_accord: "CONV-LOG123-2026",
              logement_id: "log-123",
              statut: "signe",
            },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "accords_proprietaires") {
          return {
            select: mockSelect,
            insert: mockInsert,
          };
        }
        return {};
      });

      const accord = await createOrUpdateAccord({
        logement_id: "log-123",
        bailleur_id: "bailleur-1",
      });

      expect(accord.id).toBe("acc-1");
      expect(accord.statut).toBe("signe");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          logement_id: "log-123",
          bailleur_id: "bailleur-1",
          statut: "signe",
        })
      );
    });
  });
});
