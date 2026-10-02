import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockSelect, mockEq } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockEq: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { getLandlordDashboardData } from "./landlord-dashboard-service";

describe("getLandlordDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("loads the landlord's logements and calculates dashboard counts", async () => {
    const logements = [
      { id: "home-1", statut: "valide", chambres: [{ id: "room-1" }, { id: "room-2" }] },
      { id: "home-2", statut: "en_attente", chambres: [{ id: "room-3" }] },
      { id: "home-3", statut: "rejete", chambres: [] },
    ];
    mockEq.mockResolvedValue({ data: logements, error: null });

    await expect(getLandlordDashboardData("landlord-1")).resolves.toEqual({
      logements,
      totalLogements: 3,
      logementsValides: 1,
      logementsEnAttente: 1,
      totalChambres: 3,
    });
    expect(mockFrom).toHaveBeenCalledWith("logements");
    expect(mockSelect).toHaveBeenCalledWith("*, chambres(*)");
    expect(mockEq).toHaveBeenCalledWith("bailleur_id", "landlord-1");
  });

  it("returns zero counts for an empty result", async () => {
    mockEq.mockResolvedValue({ data: null, error: null });

    await expect(getLandlordDashboardData("landlord-1")).resolves.toMatchObject({
      logements: [],
      totalLogements: 0,
      logementsValides: 0,
      logementsEnAttente: 0,
      totalChambres: 0,
    });
  });

  it("propagates the logement query error", async () => {
    const error = new Error("Échec du chargement du dashboard bailleur");
    mockEq.mockResolvedValue({ data: null, error });

    await expect(getLandlordDashboardData("landlord-1")).rejects.toBe(error);
  });
});