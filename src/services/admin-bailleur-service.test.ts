import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, mockSelect, mockRoleEq, mockProfileIn, mockUpdate, mockUpdateEq } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockRoleEq: vi.fn(),
  mockProfileIn: vi.fn(),
  mockUpdate: vi.fn(),
  mockUpdateEq: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { getAdminBailleurs, updateBailleurValidation } from "./admin-bailleur-service";

describe("admin bailleur service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => table === "profiles"
      ? { select: mockSelect }
      : { select: mockSelect, update: mockUpdate });
    mockSelect.mockImplementation(() => ({ eq: mockRoleEq, in: mockProfileIn }));
    mockUpdate.mockReturnValue({ eq: mockUpdateEq });
  });

  it("loads bailleur roles and matches their profiles", async () => {
    const roles = [
      { id: "role-1", user_id: "user-1", role: "bailleur", is_validated: false },
      { id: "role-2", user_id: "user-2", role: "bailleur", is_validated: true },
    ];
    const profiles = [{ user_id: "user-1", nom: "Diallo", prenom: "Awa" }];
    mockRoleEq.mockResolvedValue({ data: roles, error: null });
    mockProfileIn.mockResolvedValue({ data: profiles, error: null });

    await expect(getAdminBailleurs()).resolves.toEqual([
      { ...roles[0], profile: profiles[0] },
      { ...roles[1], profile: undefined },
    ]);
    expect(mockFrom).toHaveBeenCalledWith("user_roles");
    expect(mockRoleEq).toHaveBeenCalledWith("role", "bailleur");
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockProfileIn).toHaveBeenCalledWith("user_id", ["user-1", "user-2"]);
  });

  it("returns immediately when no bailleur roles exist", async () => {
    mockRoleEq.mockResolvedValue({ data: [], error: null });

    await expect(getAdminBailleurs()).resolves.toEqual([]);
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it("propagates errors from either read", async () => {
    const rolesError = new Error("Échec des rôles");
    mockRoleEq.mockResolvedValue({ data: null, error: rolesError });
    await expect(getAdminBailleurs()).rejects.toBe(rolesError);
    expect(mockProfileIn).not.toHaveBeenCalled();

    const profilesError = new Error("Échec des profils");
    mockRoleEq.mockResolvedValue({ data: [{ user_id: "user-1" }], error: null });
    mockProfileIn.mockResolvedValue({ data: null, error: profilesError });
    await expect(getAdminBailleurs()).rejects.toBe(profilesError);
  });

  it("updates validation and propagates errors", async () => {
    mockUpdateEq.mockResolvedValue({ error: null });

    await expect(updateBailleurValidation("role-1", true)).resolves.toBeUndefined();
    expect(mockUpdate).toHaveBeenCalledWith({ is_validated: true });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "role-1");

    const error = new Error("Échec de validation");
    mockUpdateEq.mockResolvedValue({ error });
    await expect(updateBailleurValidation("role-1", false)).rejects.toBe(error);
  });
});