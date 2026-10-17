import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockSelect, mockInsert, mockUpdate, mockEq, mockOrder, mockSingle, mockGetUser } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
  mockOrder: vi.fn(),
  mockSingle: vi.fn(),
  mockGetUser: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: mockFrom,
    auth: { getUser: mockGetUser },
    rpc: vi.fn().mockResolvedValue({ data: null, error: new Error("RPC not found") }),
  },
}));

import {
  sendContractReminder,
  requestContractRenewal,
  adminRespondToRenewal,
  studentRespondToTariff,
} from "./contract-renewal-service";

describe("contract-renewal-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });

    mockFrom.mockImplementation(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    }));

    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    });

    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({ single: mockSingle }),
    });

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      single: mockSingle,
      order: mockOrder,
      eq: mockEq,
    });
  });

  it("records a manual contract reminder with message and admin id", async () => {
    const reminderData = { id: "reminder-1", message: "Échéance proche" };
    mockSingle.mockResolvedValue({ data: reminderData, error: null });

    const result = await sendContractReminder({
      contratId: "contrat-1",
      typeCanal: "plateforme",
      message: "Bonjour, votre contrat se termine bientôt. Souhaitez-vous le renouveler ?",
    });

    expect(mockFrom).toHaveBeenCalledWith("contrat_rappels");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        contrat_id: "contrat-1",
        administrateur_id: "admin-1",
        type_canal: "plateforme",
        statut_envoi: "envoye",
      })
    );
    expect(result).toBe(reminderData);
  });

  it("submits a renewal request with desired end date", async () => {
    mockSingle.mockResolvedValue({ data: { id: "renewal-1" }, error: null });

    const result = await requestContractRenewal({
      contratId: "contrat-1",
      etudiantId: "student-1",
      nouvelleDateDebut: "2026-11-01",
      nouvelleDateFin: "2027-08-31",
      tarifActuel: 50000,
    });

    expect(mockFrom).toHaveBeenCalledWith("contrat_renouvellements");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        contrat_id: "contrat-1",
        etudiant_id: "student-1",
        nouvelle_date_fin: "2027-08-31",
        statut: "en_attente",
      })
    );
    expect(result).toEqual({ id: "renewal-1" });
  });

  it("proposes a new tariff with required reason", async () => {
    mockEq.mockResolvedValue({ error: null });

    const res = await adminRespondToRenewal({
      renewalId: "renewal-1",
      decision: "proposer_nouveau_tarif",
      nouveauTarif: 55000,
      motifModification: "Ajustement charges électricité",
    });

    expect(mockFrom).toHaveBeenCalledWith("contrat_renouvellements");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        statut: "propose_tarif_modifie",
        nouveau_tarif_propose: 55000,
        motif_modification_tarif: "Ajustement charges électricité",
      })
    );
    expect(res).toEqual({ success: true });
  });

  it("fails to propose a new tariff without a reason", async () => {
    await expect(
      adminRespondToRenewal({
        renewalId: "renewal-1",
        decision: "proposer_nouveau_tarif",
        nouveauTarif: 55000,
        motifModification: "",
      })
    ).rejects.toThrow("Le motif de la modification de tarif est obligatoire.");
  });

  it("rejects a renewal with required refusal reason", async () => {
    mockEq.mockResolvedValue({ error: null });

    const res = await adminRespondToRenewal({
      renewalId: "renewal-1",
      decision: "refuser",
      motifRefus: "Logement non disponible auprès du propriétaire",
    });

    expect(mockFrom).toHaveBeenCalledWith("contrat_renouvellements");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        statut: "refuse",
        motif_refus: "Logement non disponible auprès du propriétaire",
      })
    );
    expect(res).toEqual({ success: true });
  });

  it("updates renewal status when student accepts proposed tariff", async () => {
    mockEq.mockResolvedValue({ error: null });

    const res = await studentRespondToTariff({
      renewalId: "renewal-1",
      accept: true,
    });

    expect(mockFrom).toHaveBeenCalledWith("contrat_renouvellements");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        statut: "accepte_par_etudiant",
      })
    );
    expect(res).toEqual({ success: true });
  });
});
