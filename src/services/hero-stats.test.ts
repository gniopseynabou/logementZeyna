import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockLogementCount, mockRoomCount, mockCities } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockLogementCount: vi.fn(),
  mockRoomCount: vi.fn(),
  mockCities: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { getHeroStats } from "./public-content-service";

describe("getHeroStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => ({
      select: (_columns: string, options?: { head?: boolean }) => {
        if (table === "chambres") return mockRoomCount();
        if (options?.head) return mockLogementCount();
        return { eq: () => mockCities() };
      },
    }));
    mockLogementCount.mockReturnValue({ eq: () => Promise.resolve({ count: 4, error: null }) });
    mockRoomCount.mockResolvedValue({ count: 12, error: null });
    mockCities.mockResolvedValue({ data: [{ ville: "Saint-Louis" }, { ville: "Sanar" }, { ville: "Saint-Louis" }], error: null });
  });

  it("returns validated logement, room, and distinct city counts", async () => {
    await expect(getHeroStats()).resolves.toEqual([
      { id: "1", valeur: "4", label: "Logements" },
      { id: "2", valeur: "12", label: "Chambres" },
      { id: "3", valeur: "2", label: "Quartiers" },
    ]);
    expect(mockFrom).toHaveBeenCalledWith("logements");
    expect(mockFrom).toHaveBeenCalledWith("chambres");
  });

  it("propagates failures from any statistics query", async () => {
    const error = new Error("Échec des statistiques publiques");
    mockRoomCount.mockResolvedValue({ count: null, error });

    await expect(getHeroStats()).rejects.toBe(error);
  });
});