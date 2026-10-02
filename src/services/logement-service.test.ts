import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockSelect, mockEq, mockOrder, mockLimit, mockSingle, mockInsert, mockUpdate } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockEq: vi.fn(),
  mockOrder: vi.fn(),
  mockLimit: vi.fn(),
  mockSingle: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import {
  getAdminLogements,
  getLandlordLogements,
  getPublicLogements,
  getValidatedLogementsForTariffs,
  updateRoomTariff,
  updateAdminLogementStatus,
} from "./logement-service";

describe("getPublicLogements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder, limit: mockLimit, single: mockSingle });
    mockUpdate.mockReturnValue({ eq: mockEq });
  });

  it("loads validated logements with their rooms, newest first", async () => {
    const data = [{ id: "logement-1" }];
    mockOrder.mockResolvedValue({ data, error: null });

    await expect(getPublicLogements()).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("logements");
    expect(mockSelect).toHaveBeenCalledWith("*, chambres(*)");
    expect(mockEq).toHaveBeenCalledWith("statut", "valide");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("throws query errors", async () => {
    const error = new Error("Échec du chargement");
    mockOrder.mockResolvedValue({ data: null, error });

    await expect(getPublicLogements()).rejects.toBe(error);
  });

  it("loads up to six validated logements for the landing page", async () => {
    const data = [{ id: "logement-1", chambres: [] }];
    mockLimit.mockResolvedValue({ data, error: null });

    const { getPopularLogements } = await import("./logement-service");
    await expect(getPopularLogements()).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("logements");
    expect(mockSelect).toHaveBeenCalledWith("*, chambres(*)");
    expect(mockEq).toHaveBeenCalledWith("statut", "valide");
    expect(mockLimit).toHaveBeenCalledWith(6);
  });

  it("propagates errors when loading popular logements", async () => {
    const error = new Error("Échec du chargement des logements populaires");
    mockLimit.mockResolvedValue({ data: null, error });

    const { getPopularLogements } = await import("./logement-service");
    await expect(getPopularLogements()).rejects.toBe(error);
  });

  it("loads a landlord's logements with their rooms, newest first", async () => {
    const data = [{ id: "logement-1", chambres: [] }];
    mockOrder.mockResolvedValue({ data, error: null });

    await expect(getLandlordLogements("landlord-1")).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("logements");
    expect(mockSelect).toHaveBeenCalledWith("*, chambres(*)");
    expect(mockEq).toHaveBeenCalledWith("bailleur_id", "landlord-1");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("propagates landlord logement query errors", async () => {
    const error = new Error("Échec du chargement des logements bailleur");
    mockOrder.mockResolvedValue({ data: null, error });

    await expect(getLandlordLogements("landlord-1")).rejects.toBe(error);
  });

  it("loads admin logements with their rooms, newest first", async () => {
    const data = [{ id: "logement-1", chambres: [] }];
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data, error: null });

    await expect(getAdminLogements()).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("logements");
    expect(mockSelect).toHaveBeenCalledWith("*, chambres(*)");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("updates a logement status and propagates database errors", async () => {
    const error = new Error("Échec de mise à jour du statut");
    mockEq.mockResolvedValue({ error });

    await expect(updateAdminLogementStatus("logement-1", "valide")).rejects.toBe(error);
    expect(mockFrom).toHaveBeenCalledWith("logements");
    expect(mockEq).toHaveBeenCalledWith("id", "logement-1");
  });

  it("loads only validated logements for tariff management", async () => {
    const data = [{ id: "logement-1", nom: "Résidence", chambres: [] }];
    mockEq.mockResolvedValue({ data, error: null });

    await expect(getValidatedLogementsForTariffs()).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("logements");
    expect(mockSelect).toHaveBeenCalledWith("id, nom, chambres(*)");
    expect(mockEq).toHaveBeenCalledWith("statut", "valide");
  });

  it("propagates errors when loading validated logements for tariffs", async () => {
    const error = new Error("Échec du chargement des tarifs");
    mockEq.mockResolvedValue({ data: null, error });

    await expect(getValidatedLogementsForTariffs()).rejects.toBe(error);
  });

  it("updates room price and margin and propagates errors", async () => {
    mockEq.mockResolvedValue({ error: null });

    await expect(updateRoomTariff("room-1", 22000, 7000)).resolves.toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith("chambres");
    expect(mockUpdate).toHaveBeenCalledWith({ prix_zeyna: 22000, marge: 7000 });
    expect(mockEq).toHaveBeenCalledWith("id", "room-1");

    const error = new Error("Échec de mise à jour du tarif");
    mockEq.mockResolvedValue({ error });
    await expect(updateRoomTariff("room-1", 22000, 7000)).rejects.toBe(error);
  });

  it("loads a logement by id with its rooms", async () => {
    const data = { id: "logement-1", chambres: [] };
    mockSingle.mockResolvedValue({ data, error: null });

    const { getLogementDetail } = await import("./logement-service");
    await expect(getLogementDetail("logement-1")).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("logements");
    expect(mockEq).toHaveBeenCalledWith("id", "logement-1");
  });

  it("creates a pending reservation with today's date", async () => {
    mockInsert.mockResolvedValue({ error: null });

    const { createReservation } = await import("./logement-service");
    await expect(createReservation({
      studentId: "student-1",
      roomId: "room-1",
      logementId: "logement-1",
      amount: 25000,
    })).resolves.toEqual({ error: null });

    expect(mockFrom).toHaveBeenCalledWith("reservations");
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      etudiant_id: "student-1",
      chambre_id: "room-1",
      logement_id: "logement-1",
      montant_total: 25000,
      date_debut: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      statut: "en_attente",
    }));
  });
});