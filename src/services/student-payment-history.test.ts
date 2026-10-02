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

import { getStudentPaymentHistory } from "./payment-service";

describe("getStudentPaymentHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
  });

  it("loads a student's payments with associated housing details, newest first", async () => {
    const data = [{ id: "payment-1", montant: 18000 }];
    mockOrder.mockResolvedValue({ data, error: null });

    await expect(getStudentPaymentHistory("student-1")).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("paiements");
    expect(mockSelect).toHaveBeenCalledWith("*, reservations(logements(nom), chambres(nom))");
    expect(mockEq).toHaveBeenCalledWith("etudiant_id", "student-1");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("returns an empty array when no payments are found", async () => {
    mockOrder.mockResolvedValue({ data: null, error: null });

    await expect(getStudentPaymentHistory("student-1")).resolves.toEqual([]);
  });

  it("propagates payment history query errors", async () => {
    const error = new Error("Échec du chargement des paiements");
    mockOrder.mockResolvedValue({ data: null, error });

    await expect(getStudentPaymentHistory("student-1")).rejects.toBe(error);
  });
});