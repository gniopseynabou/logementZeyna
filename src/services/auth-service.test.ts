import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockSignIn,
  mockSignUp,
  mockGetUser,
  mockRoleLookup,
  mockFrom,
  mockProfileLookup,
  mockRoleDataLookup,
  mockResetPasswordForEmail,
  mockUpdateUser,
  mockGetSession,
  mockSignOut,
} = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSignUp: vi.fn(),
  mockGetUser: vi.fn(),
  mockRoleLookup: vi.fn(),
  mockFrom: vi.fn(),
  mockProfileLookup: vi.fn(),
  mockRoleDataLookup: vi.fn(),
  mockResetPasswordForEmail: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockGetSession: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
      getUser: mockGetUser,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      getSession: mockGetSession,
      signOut: mockSignOut,
    },
    from: mockFrom,
  },
}));

import { signInWithRole } from "./auth-service";

describe("signInWithRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => ({
      select: () => ({
        eq: () => table === "profiles"
          ? { maybeSingle: mockProfileLookup }
          : { single: mockRoleLookup, maybeSingle: mockRoleDataLookup },
      }),
    }));
  });

  it("returns the authenticated user's role", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockRoleLookup.mockResolvedValue({ data: { role: "bailleur" } });

    await expect(signInWithRole("personne@example.com", "secret")).resolves.toEqual({
      error: null,
      role: "bailleur",
    });
  });

  it("defaults to the student role when no role is available", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockRoleLookup.mockResolvedValue({ data: null });

    await expect(signInWithRole("personne@example.com", "secret")).resolves.toEqual({
      error: null,
      role: "etudiant",
    });
  });

  it("returns authentication errors without querying a role", async () => {
    const error = new Error("Identifiants invalides");
    mockSignIn.mockResolvedValue({ error });

    await expect(signInWithRole("personne@example.com", "secret")).resolves.toEqual({
      error,
      role: null,
    });
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockRoleLookup).not.toHaveBeenCalled();
  });

  it("loads profile, role, and validation state together", async () => {
    mockProfileLookup.mockResolvedValue({ data: { id: "profile-1", user_id: "user-1" }, error: null });
    mockRoleDataLookup.mockResolvedValue({ data: { role: "bailleur", is_validated: true }, error: null });

    const { getUserAuthData } = await import("./auth-service");
    await expect(getUserAuthData("user-1")).resolves.toEqual({
      profile: { id: "profile-1", user_id: "user-1" },
      role: "bailleur",
      isValidated: true,
    });
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockFrom).toHaveBeenCalledWith("user_roles");
  });

  it("clears missing profile and role data", async () => {
    mockProfileLookup.mockResolvedValue({ data: null, error: null });
    mockRoleDataLookup.mockResolvedValue({ data: null, error: null });

    const { getUserAuthData } = await import("./auth-service");
    await expect(getUserAuthData("user-1")).resolves.toEqual({
      profile: null,
      role: null,
      isValidated: false,
    });
  });

  it("propagates profile or role query errors", async () => {
    const error = new Error("Échec du chargement du profil");
    mockProfileLookup.mockResolvedValue({ data: null, error });
    mockRoleDataLookup.mockResolvedValue({ data: null, error: null });

    const { getUserAuthData } = await import("./auth-service");
    await expect(getUserAuthData("user-1")).rejects.toBe(error);
  });

  it("registers with profile metadata and the email redirect URL", async () => {
    mockSignUp.mockResolvedValue({ data: { user: null }, error: null });

    const { registerUser } = await import("./auth-service");
    await expect(registerUser({
      email: "personne@example.com",
      password: "secret123",
      nom: "Diallo",
      prenom: "Aminata",
      telephone: "+221770000000",
      role: "bailleur",
      redirectTo: "https://example.com/login",
    })).resolves.toEqual({ error: null });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "personne@example.com",
      password: "secret123",
      options: {
        data: {
          nom: "Diallo",
          prenom: "Aminata",
          telephone: "+221770000000",
          role: "bailleur",
        },
        emailRedirectTo: "https://example.com/login",
      },
    });
  });

  it("returns registration errors to the calling page", async () => {
    const error = new Error("Adresse email déjà utilisée");
    mockSignUp.mockResolvedValue({ data: { user: null }, error });

    const { registerUser } = await import("./auth-service");
    await expect(registerUser({
      email: "personne@example.com",
      password: "secret123",
      nom: "Diallo",
      prenom: "Aminata",
      telephone: "",
      role: "etudiant",
      redirectTo: "https://example.com/login",
    })).resolves.toEqual({ error });
  });

  it("requests password recovery with the supplied redirect URL", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    const { requestPasswordReset } = await import("./auth-service");
    await expect(requestPasswordReset("personne@example.com", "https://example.com/reset-password"))
      .resolves.toEqual({ error: null });
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith("personne@example.com", {
      redirectTo: "https://example.com/reset-password",
    });
  });

  it("updates the password and returns authentication errors", async () => {
    mockUpdateUser.mockResolvedValueOnce({ error: null });
    const { resetUserPassword } = await import("./auth-service");

    await expect(resetUserPassword("new-password")).resolves.toEqual({ error: null });
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: "new-password" });

    const error = new Error("Lien expiré");
    mockUpdateUser.mockResolvedValueOnce({ error });
    await expect(resetUserPassword("new-password")).resolves.toEqual({ error });
  });

  it("returns the current session and propagates session errors", async () => {
    const session = { access_token: "token" };
    mockGetSession.mockResolvedValue({ data: { session }, error: null });
    const { getCurrentSession } = await import("./auth-service");

    await expect(getCurrentSession()).resolves.toBe(session);

    const error = new Error("Session indisponible");
    mockGetSession.mockResolvedValue({ data: { session: null }, error });
    await expect(getCurrentSession()).rejects.toBe(error);
  });

  it("reports sign-out failures to its caller", async () => {
    const error = new Error("Échec de déconnexion");
    mockSignOut.mockResolvedValue({ error });
    const { signOutUser } = await import("./auth-service");

    await expect(signOutUser()).rejects.toBe(error);
  });

  it("accepts only a recovery type in the URL hash", async () => {
    const { isPasswordRecoveryLink } = await import("./auth-service");

    expect(isPasswordRecoveryLink("#access_token=token&type=recovery&expires_in=3600")).toBe(true);
    expect(isPasswordRecoveryLink("#access_token=token&type=signup")).toBe(false);
    expect(isPasswordRecoveryLink("#other=type%3Drecovery")).toBe(false);
    expect(isPasswordRecoveryLink("")).toBe(false);
  });
});