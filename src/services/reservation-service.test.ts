import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockSelect, mockEq, mockOrder, mockUpdate, mockUpdateEq, mockRoomUpdate, mockRoomUpdateEq } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockEq: vi.fn(),
  mockOrder: vi.fn(),
  mockUpdate: vi.fn(),
  mockUpdateEq: vi.fn(),
  mockRoomUpdate: vi.fn(),
  mockRoomUpdateEq: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { cancelStudentReservation, getStudentReservations } from "./reservation-service";

describe("reservation-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => ({
      select: mockSelect,
      update: table === "chambres" ? mockRoomUpdate : mockUpdate,
    }));
    const mockQueryBuilder = {
      eq: mockEq,
      range: vi.fn().mockReturnThis(),
      order: mockOrder,
    };
    mockSelect.mockReturnValue(mockQueryBuilder);
    mockEq.mockReturnValue({ order: mockOrder });
    mockUpdate.mockReturnValue({ eq: mockUpdateEq });
    mockRoomUpdate.mockReturnValue({ eq: mockRoomUpdateEq });
  });

  it("loads reservations for the requested student, newest first", async () => {
    const data = [{ id: "reservation-1" }];
    mockOrder.mockResolvedValue({ data, error: null });

    await expect(getStudentReservations("student-1")).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("reservations");
    expect(mockSelect).toHaveBeenCalledWith("*, logements(nom, adresse), chambres(nom, prix_zeyna, caution)");
    expect(mockEq).toHaveBeenCalledWith("etudiant_id", "student-1");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("marks the requested reservation as cancelled", async () => {
    mockUpdateEq.mockResolvedValue({ error: null });

    await expect(cancelStudentReservation("reservation-1")).resolves.toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith("reservations");
    expect(mockUpdate).toHaveBeenCalledWith({ statut: "annulee" });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "reservation-1");
  });

  it("throws errors when cancelling a reservation fails", async () => {
    const error = new Error("Échec de l'annulation");
    mockUpdateEq.mockResolvedValue({ error });

    await expect(cancelStudentReservation("reservation-1")).rejects.toBe(error);
  });

  it("loads all admin reservations with their logement and room names", async () => {
    const data = [{ id: "reservation-1" }];
    mockOrder.mockResolvedValue({ data, error: null });

    const { getAdminReservations } = await import("./reservation-service");
    await expect(getAdminReservations()).resolves.toEqual({
      data,
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    });
    expect(mockSelect).toHaveBeenCalledWith("*, logements(nom), chambres(nom)", { count: "exact" });
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("updates a reservation status and frees its room when cancelled", async () => {
    mockUpdateEq.mockResolvedValue({ error: null });
    mockRoomUpdateEq.mockResolvedValue({ error: null });

    const { updateAdminReservationStatus } = await import("./reservation-service");
    await expect(updateAdminReservationStatus("reservation-1", "annulee", "room-1"))
      .resolves.toBeUndefined();

    expect(mockUpdate).toHaveBeenCalledWith({ statut: "annulee" });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "reservation-1");
    expect(mockRoomUpdate).toHaveBeenCalledWith({ est_disponible: true });
    expect(mockRoomUpdateEq).toHaveBeenCalledWith("id", "room-1");
  });

  it("does not free a room when another status is selected", async () => {
    mockUpdateEq.mockResolvedValue({ error: null });

    const { updateAdminReservationStatus } = await import("./reservation-service");
    await updateAdminReservationStatus("reservation-1", "confirmee", "room-1");

    expect(mockRoomUpdate).not.toHaveBeenCalled();
  });
});