import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFrom,
  mockLogementInsert,
  mockSelect,
  mockSingle,
  mockLogementUpdate,
  mockLogementUpdateEq,
  mockRoomInsert,
  mockStorageUpload,
  mockGetPublicUrl,
} = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockLogementInsert: vi.fn(),
  mockSelect: vi.fn(),
  mockSingle: vi.fn(),
  mockLogementUpdate: vi.fn(),
  mockLogementUpdateEq: vi.fn(),
  mockRoomInsert: vi.fn(),
  mockStorageUpload: vi.fn(),
  mockGetPublicUrl: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: mockFrom,
    storage: {
      from: () => ({
        upload: mockStorageUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  },
}));

import { createLandlordLogement } from "./logement-service";

const input = (overrides: Partial<Parameters<typeof createLandlordLogement>[0]> = {}) => ({
  nom: "Résidence Zeyna",
  adresse: "Quartier Sanar",
  ville: "Saint-Louis",
  type: "résidence",
  description: "Description",
  conditionsElectricite: "Électricité incluse",
  latitude: 16.06,
  longitude: -16.43,
  landlordId: "landlord-1",
  chambres: [{
    nom: "Chambre A",
    nombre_personnes: 1,
    prix_bailleur: 15000,
    caution: 15000,
    description: "Chambre simple",
  }],
  images: [],
  ...overrides,
});

describe("createLandlordLogement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => {
      if (table === "chambres") return { insert: mockRoomInsert };
      return {
        insert: mockLogementInsert,
        update: mockLogementUpdate,
      };
    });
    mockLogementInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: { id: "logement-1" }, error: null });
    mockLogementUpdate.mockReturnValue({ eq: mockLogementUpdateEq });
    mockLogementUpdateEq.mockResolvedValue({ error: null });
    mockRoomInsert.mockResolvedValue({ error: null });
    mockStorageUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: "https://cdn.example/image.jpg" } });
  });

  it("creates the logement and its rooms", async () => {
    await expect(createLandlordLogement(input())).resolves.toEqual({ id: "logement-1" });

    expect(mockFrom).toHaveBeenNthCalledWith(1, "logements");
    expect(mockLogementInsert).toHaveBeenCalledWith(expect.objectContaining({
      nom: "Résidence Zeyna",
      bailleur_id: "landlord-1",
      pays: "Sénégal",
      latitude: 16.06,
      longitude: -16.43,
    }));
    expect(mockFrom).toHaveBeenNthCalledWith(2, "chambres");
    expect(mockRoomInsert).toHaveBeenCalledWith([expect.objectContaining({
      logement_id: "logement-1",
      nom: "Chambre A",
      prix_bailleur: 15000,
    })]);
  });

  it("uploads images and stores their public URLs before creating rooms", async () => {
    const uploadStates: boolean[] = [];
    const image = new File(["image"], "photo.jpg", { type: "image/jpeg" });

    await createLandlordLogement(input({
      images: [image],
      onUploadingImages: (uploading) => uploadStates.push(uploading),
    }));

    expect(mockStorageUpload).toHaveBeenCalledWith(expect.stringMatching(/^logement-1\//), image);
    expect(mockGetPublicUrl).toHaveBeenCalled();
    expect(mockLogementUpdate).toHaveBeenCalledWith({ images: ["https://cdn.example/image.jpg"] });
    expect(uploadStates).toEqual([true, false]);
    expect(mockRoomInsert).toHaveBeenCalled();
  });

  it("propagates image upload errors and always clears the upload state", async () => {
    const error = new Error("Échec de l’upload");
    const uploadStates: boolean[] = [];
    mockStorageUpload.mockResolvedValue({ error });
    const image = new File(["image"], "photo.jpg", { type: "image/jpeg" });

    await expect(createLandlordLogement(input({
      images: [image],
      onUploadingImages: (uploading) => uploadStates.push(uploading),
    }))).rejects.toBe(error);

    expect(uploadStates).toEqual([true, false]);
    expect(mockLogementUpdate).not.toHaveBeenCalled();
    expect(mockRoomInsert).not.toHaveBeenCalled();
  });

  it("propagates errors when inserting rooms", async () => {
    const error = new Error("Échec des chambres");
    mockRoomInsert.mockResolvedValue({ error });

    await expect(createLandlordLogement(input())).rejects.toBe(error);
  });
});
