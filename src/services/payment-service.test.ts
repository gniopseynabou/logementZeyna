import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFrom,
  mockSelect,
  mockEq,
  mockSingle,
} = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockEq: vi.fn(),
  mockSingle: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { getReservationForPayment } from "./payment-service";

describe("payment-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
  });

  it("loads a reservation and its associated logement and room", async () => {
    const data = { id: "reservation-1" };
    mockSingle.mockResolvedValue({ data, error: null });

    await expect(getReservationForPayment("reservation-1")).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("reservations");
    expect(mockEq).toHaveBeenCalledWith("id", "reservation-1");
  });

});