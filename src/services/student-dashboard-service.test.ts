import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockReservationSelect, mockReservationEq, mockPaymentSelect, mockPaymentEq } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockReservationSelect: vi.fn(),
  mockReservationEq: vi.fn(),
  mockPaymentSelect: vi.fn(),
  mockPaymentEq: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { getStudentDashboardPayments } from "./payment-service";
import { getStudentDashboardReservations } from "./reservation-service";

describe("student dashboard services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => table === "reservations"
      ? { select: mockReservationSelect }
      : { select: mockPaymentSelect });
    mockReservationSelect.mockReturnValue({ eq: mockReservationEq });
    mockPaymentSelect.mockReturnValue({ eq: mockPaymentEq });
  });

  it("loads dashboard reservations for the student with related names", async () => {
    const data = [{ id: "reservation-1" }];
    mockReservationEq.mockResolvedValue({ data, error: null });

    await expect(getStudentDashboardReservations("student-1")).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("reservations");
    expect(mockReservationSelect).toHaveBeenCalledWith("*, logements(nom), chambres(nom)");
    expect(mockReservationEq).toHaveBeenCalledWith("etudiant_id", "student-1");
  });

  it("propagates reservation query errors", async () => {
    const error = new Error("Échec des réservations");
    mockReservationEq.mockResolvedValue({ data: null, error });

    await expect(getStudentDashboardReservations("student-1")).rejects.toBe(error);
  });

  it("loads dashboard payments for the student", async () => {
    const data = [{ id: "payment-1" }];
    mockPaymentEq.mockResolvedValue({ data, error: null });

    await expect(getStudentDashboardPayments("student-1")).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("paiements");
    expect(mockPaymentSelect).toHaveBeenCalledWith("*");
    expect(mockPaymentEq).toHaveBeenCalledWith("etudiant_id", "student-1");
  });

  it("propagates payment query errors", async () => {
    const error = new Error("Échec des paiements");
    mockPaymentEq.mockResolvedValue({ data: null, error });

    await expect(getStudentDashboardPayments("student-1")).rejects.toBe(error);
  });
});