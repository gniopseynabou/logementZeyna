import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFrom,
  mockSelect,
  mockOrder,
  mockPaymentUpdate,
  mockPaymentEq,
  mockReservationUpdate,
  mockReservationUpdateEq,
  mockReservationSelect,
  mockReservationEq,
  mockReservationSingle,
  mockRoomUpdate,
  mockRoomEq,
  mockContractInsert,
} = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockOrder: vi.fn(),
  mockPaymentUpdate: vi.fn(),
  mockPaymentEq: vi.fn(),
  mockReservationUpdate: vi.fn(),
  mockReservationUpdateEq: vi.fn(),
  mockReservationSelect: vi.fn(),
  mockReservationEq: vi.fn(),
  mockReservationSingle: vi.fn(),
  mockRoomUpdate: vi.fn(),
  mockRoomEq: vi.fn(),
  mockContractInsert: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { confirmAdminPayment, getAdminPayments } from "./payment-service";

describe("admin payment service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => {
      if (table === "paiements") return { select: mockSelect, update: mockPaymentUpdate };
      if (table === "chambres") return { update: mockRoomUpdate };
      if (table === "contrats") return { insert: mockContractInsert };
      return { update: mockReservationUpdate, select: mockReservationSelect };
    });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockPaymentUpdate.mockReturnValue({ eq: mockPaymentEq });
    mockReservationUpdate.mockReturnValue({ eq: mockReservationUpdateEq });
    mockReservationSelect.mockReturnValue({ eq: mockReservationEq });
    mockReservationEq.mockReturnValue({ single: mockReservationSingle });
    mockRoomUpdate.mockReturnValue({ eq: mockRoomEq });
    mockPaymentEq.mockResolvedValue({ error: null });
    mockReservationUpdateEq.mockResolvedValue({ error: null });
    mockReservationSingle.mockResolvedValue({ data: { chambre_id: "room-1" }, error: null });
    mockRoomEq.mockResolvedValue({ error: null });
    mockContractInsert.mockResolvedValue({ error: null });
  });

  it("loads payments newest first and propagates query errors", async () => {
    const data = [{ id: "payment-1" }];
    mockOrder.mockResolvedValue({ data, error: null });

    await expect(getAdminPayments()).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("paiements");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });

    const error = new Error("Échec de lecture");
    mockOrder.mockResolvedValue({ data: null, error });
    await expect(getAdminPayments()).rejects.toBe(error);
  });

  it("confirms a payment, updates its reservation and room, then creates a contract", async () => {
    await expect(confirmAdminPayment({
      paymentId: "payment-1",
      reservationId: "reservation-1",
      studentId: "student-1",
      amount: 25000,
      reference: "ZYN-ABC",
      logementName: "Résidence Zeyna",
      roomName: "Chambre A",
    })).resolves.toBeUndefined();

    expect(mockPaymentUpdate).toHaveBeenCalledWith({ est_confirme: true });
    expect(mockPaymentEq).toHaveBeenCalledWith("id", "payment-1");
    expect(mockReservationUpdate).toHaveBeenCalledWith({ statut: "confirmee" });
    expect(mockRoomUpdate).toHaveBeenCalledWith({ est_disponible: false });
    expect(mockContractInsert).toHaveBeenCalledWith(expect.objectContaining({
      etudiant_id: "student-1",
      reservation_id: "reservation-1",
      contenu: expect.objectContaining({
        montant: 25000,
        reference: "ZYN-ABC",
        logement: "Résidence Zeyna",
        chambre: "Chambre A",
      }),
    }));
  });

  it("stops and propagates an error when the payment update fails", async () => {
    const error = new Error("Échec de mise à jour");
    mockPaymentEq.mockResolvedValue({ error });

    await expect(confirmAdminPayment({
      paymentId: "payment-1",
      reservationId: "reservation-1",
      studentId: "student-1",
      amount: 25000,
      reference: null,
      logementName: null,
      roomName: null,
    })).rejects.toBe(error);

    expect(mockReservationUpdate).not.toHaveBeenCalled();
    expect(mockContractInsert).not.toHaveBeenCalled();
  });

  it("propagates room update errors instead of reporting confirmation success", async () => {
    const error = new Error("Échec de blocage de chambre");
    mockRoomEq.mockResolvedValue({ error });

    await expect(confirmAdminPayment({
      paymentId: "payment-1",
      reservationId: "reservation-1",
      studentId: "student-1",
      amount: 25000,
      reference: null,
      logementName: null,
      roomName: null,
    })).rejects.toBe(error);

    expect(mockContractInsert).not.toHaveBeenCalled();
  });
});