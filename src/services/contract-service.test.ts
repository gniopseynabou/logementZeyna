import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockSelect, mockEq, mockOrder } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockEq: vi.fn(),
  mockOrder: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { getStudentContracts } from "./contract-service";

describe("getStudentContracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
  });

  it("loads a student's contracts with housing details, newest first", async () => {
    const data = [{ id: "contract-1", contenu: { reference: "ZYN-1" } }];
    mockOrder.mockResolvedValue({ data, error: null });

    await expect(getStudentContracts("student-1")).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("contrats");
    expect(mockSelect).toHaveBeenCalledWith(
      "*, reservations(logements(nom, adresse, ville), chambres(nom, prix_zeyna, caution, nombre_personnes))"
    );
    expect(mockEq).toHaveBeenCalledWith("etudiant_id", "student-1");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("returns an empty list when the student has no contracts", async () => {
    mockOrder.mockResolvedValue({ data: null, error: null });

    await expect(getStudentContracts("student-1")).resolves.toEqual([]);
  });

  it("propagates contract query errors", async () => {
    const error = new Error("Échec du chargement des contrats");
    mockOrder.mockResolvedValue({ data: null, error });

    await expect(getStudentContracts("student-1")).rejects.toBe(error);
  });
});