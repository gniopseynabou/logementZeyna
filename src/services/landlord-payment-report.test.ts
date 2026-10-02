import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFrom,
  mockLogementSelect,
  mockLogementEq,
  mockReservationSelect,
  mockReservationIn,
  mockReservationEq,
  mockPaymentSelect,
  mockPaymentIn,
  mockPaymentOrder,
} = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockLogementSelect: vi.fn(),
  mockLogementEq: vi.fn(),
  mockReservationSelect: vi.fn(),
  mockReservationIn: vi.fn(),
  mockReservationEq: vi.fn(),
  mockPaymentSelect: vi.fn(),
  mockPaymentIn: vi.fn(),
  mockPaymentOrder: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { getLandlordPaymentReport } from "./payment-service";

describe("getLandlordPaymentReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => {
      if (table === "logements") return { select: mockLogementSelect };
      if (table === "reservations") return { select: mockReservationSelect };
      return { select: mockPaymentSelect };
    });
    mockLogementSelect.mockReturnValue({ eq: mockLogementEq });
    mockReservationSelect.mockReturnValue({ in: mockReservationIn });
    mockReservationIn.mockReturnValue({ eq: mockReservationEq });
    mockPaymentSelect.mockReturnValue({ in: mockPaymentIn });
    mockPaymentIn.mockReturnValue({ order: mockPaymentOrder });
  });

  it("returns landlord payments and sums confirmed amounts only", async () => {
    const paiements = [
      { id: "payment-1", est_confirme: true, montant: 12000 },
      { id: "payment-2", est_confirme: false, montant: 8000 },
      { id: "payment-3", est_confirme: true, montant: 15000 },
    ];
    mockLogementEq.mockResolvedValue({ data: [{ id: "home-1" }], error: null });
    mockReservationEq.mockResolvedValue({ data: [{ id: "reservation-1" }], error: null });
    mockPaymentOrder.mockResolvedValue({ data: paiements, error: null });

    await expect(getLandlordPaymentReport("landlord-1")).resolves.toEqual({
      paiements,
      total: 27000,
    });
    expect(mockLogementEq).toHaveBeenCalledWith("bailleur_id", "landlord-1");
    expect(mockReservationIn).toHaveBeenCalledWith("logement_id", ["home-1"]);
    expect(mockReservationEq).toHaveBeenCalledWith("statut", "confirmee");
    expect(mockPaymentIn).toHaveBeenCalledWith("reservation_id", ["reservation-1"]);
    expect(mockPaymentOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("returns an empty report when the landlord has no logements", async () => {
    mockLogementEq.mockResolvedValue({ data: [], error: null });

    await expect(getLandlordPaymentReport("landlord-1")).resolves.toEqual({
      paiements: [],
      total: 0,
    });
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it("propagates errors from the logement lookup", async () => {
    const error = new Error("Échec des logements");
    mockLogementEq.mockResolvedValue({ data: null, error });

    await expect(getLandlordPaymentReport("landlord-1")).rejects.toBe(error);
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it("propagates errors from the reservation lookup", async () => {
    const error = new Error("Échec des réservations");
    mockLogementEq.mockResolvedValue({ data: [{ id: "home-1" }], error: null });
    mockReservationEq.mockResolvedValue({ data: null, error });

    await expect(getLandlordPaymentReport("landlord-1")).rejects.toBe(error);
    expect(mockFrom).toHaveBeenCalledTimes(2);
  });

  it("propagates errors from the payment lookup", async () => {
    const error = new Error("Échec des paiements");
    mockLogementEq.mockResolvedValue({ data: [{ id: "home-1" }], error: null });
    mockReservationEq.mockResolvedValue({ data: [{ id: "reservation-1" }], error: null });
    mockPaymentOrder.mockResolvedValue({ data: null, error });

    await expect(getLandlordPaymentReport("landlord-1")).rejects.toBe(error);
  });
});