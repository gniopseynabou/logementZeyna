import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockUpdate, mockEq, mockStorageUpload, mockGetPublicUrl, mockUpdateUser } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
  mockStorageUpload: vi.fn(),
  mockGetPublicUrl: vi.fn(),
  mockUpdateUser: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: mockFrom,
    storage: {
      from: () => ({ upload: mockStorageUpload, getPublicUrl: mockGetPublicUrl }),
    },
    auth: { updateUser: mockUpdateUser },
  },
}));

import { updateUserPassword, updateUserProfile, uploadUserAvatar } from "./profile-service";

describe("profile service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ update: mockUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
    mockStorageUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: "https://cdn.example/avatar.jpg" } });
    mockUpdateUser.mockResolvedValue({ error: null });
  });

  it("updates profile fields for the given user", async () => {
    const profile = { nom: "Diallo", prenom: "Awa", telephone: "+221770000000" };

    await expect(updateUserProfile("user-1", profile)).resolves.toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockUpdate).toHaveBeenCalledWith(profile);
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("uploads the avatar and saves its public URL to the profile", async () => {
    const file = new File(["avatar"], "portrait.jpg", { type: "image/jpeg" });

    await expect(uploadUserAvatar("user-1", file)).resolves.toBe("https://cdn.example/avatar.jpg");
    expect(mockStorageUpload).toHaveBeenCalledWith("user-1/avatar.jpg", file, { upsert: true });
    expect(mockGetPublicUrl).toHaveBeenCalledWith("user-1/avatar.jpg");
    expect(mockUpdate).toHaveBeenCalledWith({ avatar_url: "https://cdn.example/avatar.jpg" });
  });

  it("does not update the profile when avatar upload fails", async () => {
    const error = new Error("Échec de l’upload");
    mockStorageUpload.mockResolvedValue({ error });
    const file = new File(["avatar"], "portrait.jpg", { type: "image/jpeg" });

    await expect(uploadUserAvatar("user-1", file)).rejects.toBe(error);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("propagates profile and password update errors", async () => {
    const profileError = new Error("Échec du profil");
    mockEq.mockResolvedValue({ error: profileError });
    await expect(updateUserProfile("user-1", { nom: "N", prenom: "P", telephone: "" }))
      .rejects.toBe(profileError);

    const passwordError = new Error("Échec du mot de passe");
    mockUpdateUser.mockResolvedValue({ error: passwordError });
    await expect(updateUserPassword("new-password")).rejects.toBe(passwordError);
  });
});