import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockRoleQuery, mockProfilesIn, mockUpdate, mockUpdateEq } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockRoleQuery: vi.fn(),
  mockProfilesIn: vi.fn(),
  mockUpdate: vi.fn(),
  mockUpdateEq: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { getAdminUsers, updateAdminUserValidation } from "./admin-user-service";

describe("admin user service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => table === "profiles"
      ? { select: () => ({ in: mockProfilesIn }) }
      : { select: () => mockRoleQuery(), update: mockUpdate });
    mockUpdate.mockReturnValue({ eq: mockUpdateEq });
  });

  it("loads role rows and matches each profile to its user", async () => {
    const roles = [
      { id: "role-1", user_id: "user-1", role: "admin" },
      { id: "role-2", user_id: "user-2", role: "etudiant" },
    ];
    const profiles = [{ user_id: "user-1", nom: "Zeyna" }, { user_id: "user-2", nom: "Ba" }];
    mockRoleQuery.mockResolvedValue({ data: roles, error: null });
    mockProfilesIn.mockResolvedValue({ data: profiles, error: null });

    await expect(getAdminUsers()).resolves.toEqual([
      { ...roles[0], profile: profiles[0] },
      { ...roles[1], profile: profiles[1] },
    ]);
    expect(mockFrom).toHaveBeenCalledWith("user_roles");
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockProfilesIn).toHaveBeenCalledWith("user_id", ["user-1", "user-2"]);
  });

  it("returns an empty list without querying profiles when there are no roles", async () => {
    mockRoleQuery.mockResolvedValue({ data: [], error: null });

    await expect(getAdminUsers()).resolves.toEqual([]);
    expect(mockProfilesIn).not.toHaveBeenCalled();
  });

  it("propagates role and profile read errors", async () => {
    const rolesError = new Error("Échec de lecture des rôles");
    mockRoleQuery.mockResolvedValue({ data: null, error: rolesError });
    await expect(getAdminUsers()).rejects.toBe(rolesError);
    expect(mockProfilesIn).not.toHaveBeenCalled();

    const profileError = new Error("Échec de lecture des profils");
    mockRoleQuery.mockResolvedValue({ data: [{ user_id: "user-1" }], error: null });
    mockProfilesIn.mockResolvedValue({ data: null, error: profileError });
    await expect(getAdminUsers()).rejects.toBe(profileError);
  });

  it("updates user validation and propagates update errors", async () => {
    mockUpdateEq.mockResolvedValue({ error: null });

    await expect(updateAdminUserValidation("role-1", true)).resolves.toBeUndefined();
    expect(mockUpdate).toHaveBeenCalledWith({ is_validated: true });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "role-1");

    const error = new Error("Échec de validation");
    mockUpdateEq.mockResolvedValue({ error });
    await expect(updateAdminUserValidation("role-1", false)).rejects.toBe(error);
  });
});