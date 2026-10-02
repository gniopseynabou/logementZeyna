import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockQuery, mockRoleEq } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockQuery: vi.fn(),
  mockRoleEq: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { calculateAdminDashboardStats, getAdminDashboardStats } from "./admin-dashboard-service";

describe("admin dashboard service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => ({
      select: () => table === "user_roles" ? { eq: mockRoleEq } : mockQuery(),
    }));
    mockQuery.mockResolvedValue({ data: [], error: null });
    mockRoleEq.mockImplementation(() => mockQuery());
  });

  it("calculates counts, confirmed revenue, and room occupancy", () => {
    expect(calculateAdminDashboardStats({
      logements: [{ statut: "valide" }, { statut: "en_attente" }, { statut: "rejete" }],
      reservations: [{ statut: "confirmee" }, { statut: "en_attente" }, { statut: "annulee" }],
      paiements: [
        { montant: 10000, est_confirme: true },
        { montant: 7000, est_confirme: false },
        { montant: 5000, est_confirme: true },
      ],
      bailleurs: [{ is_validated: true }, { is_validated: false }],
      chambres: [{ est_disponible: false }, { est_disponible: true }, { est_disponible: false }],
    })).toEqual({
      totalLogements: 3,
      logValides: 1,
      logEnAttente: 1,
      totalReservations: 3,
      resConfirmees: 1,
      resEnAttente: 1,
      revenus: 15000,
      totalBailleurs: 2,
      bailleursValides: 1,
      bailleursEnAttente: 1,
      tauxOccupation: 67,
      totalChambres: 3,
      chambresOccupees: 2,
    });
  });

  it("returns zero occupancy when no rooms exist", () => {
    expect(calculateAdminDashboardStats({
      logements: [],
      reservations: [],
      paiements: [],
      bailleurs: [],
      chambres: [],
    }).tauxOccupation).toBe(0);
  });

  it("loads all five datasets and filters the landlord role", async () => {
    await getAdminDashboardStats();

    expect(mockFrom).toHaveBeenCalledTimes(5);
    expect(mockFrom).toHaveBeenCalledWith("logements");
    expect(mockFrom).toHaveBeenCalledWith("reservations");
    expect(mockFrom).toHaveBeenCalledWith("paiements");
    expect(mockFrom).toHaveBeenCalledWith("user_roles");
    expect(mockFrom).toHaveBeenCalledWith("chambres");
    expect(mockRoleEq).toHaveBeenCalledWith("role", "bailleur");
  });

  it("rejects the dashboard query when any dataset fails", async () => {
    const error = new Error("Échec du chargement des paiements");
    mockQuery
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: null, error })
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [], error: null });

    await expect(getAdminDashboardStats()).rejects.toBe(error);
  });
});