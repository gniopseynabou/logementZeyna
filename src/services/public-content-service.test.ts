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

import { getVisibleFaqs, getVisibleTestimonials } from "./public-content-service";

describe("getVisibleFaqs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
  });

  it("loads only visible FAQs in their configured order", async () => {
    const data = [{ id: "faq-1", question: "Question ?", reponse: "Réponse" }];
    mockOrder.mockResolvedValue({ data, error: null });

    await expect(getVisibleFaqs()).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("faqs");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("est_visible", true);
    expect(mockOrder).toHaveBeenCalledWith("ordre");
  });

  it("returns an empty list when no visible FAQs are found", async () => {
    mockOrder.mockResolvedValue({ data: null, error: null });

    await expect(getVisibleFaqs()).resolves.toEqual([]);
  });

  it("propagates query errors", async () => {
    const error = new Error("Échec du chargement de la FAQ");
    mockOrder.mockResolvedValue({ data: null, error });

    await expect(getVisibleFaqs()).rejects.toBe(error);
  });

  it("loads only visible testimonials, newest first", async () => {
    const data = [{ id: "testimonial-1", nom: "Awa", note: 5 }];
    mockOrder.mockResolvedValue({ data, error: null });

    await expect(getVisibleTestimonials()).resolves.toBe(data);
    expect(mockFrom).toHaveBeenCalledWith("temoignages");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("est_visible", true);
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("returns an empty list when no visible testimonials are found", async () => {
    mockOrder.mockResolvedValue({ data: null, error: null });

    await expect(getVisibleTestimonials()).resolves.toEqual([]);
  });

  it("propagates testimonial query errors", async () => {
    const error = new Error("Échec du chargement des témoignages");
    mockOrder.mockResolvedValue({ data: null, error });

    await expect(getVisibleTestimonials()).rejects.toBe(error);
  });
});