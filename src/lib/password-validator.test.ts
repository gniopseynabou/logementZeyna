import { describe, it, expect } from "vitest";
import { validatePassword } from "./password-validator";

describe("SEC-009 : Validation de la robustesse des mots de passe", () => {
  it("rejette les mots de passe de moins de 8 caractères", () => {
    expect(validatePassword("Ab1").isValid).toBe(false);
    expect(validatePassword("Abcdef1").isValid).toBe(false);
  });

  it("rejette les mots de passe sans chiffre", () => {
    expect(validatePassword("MotDePasseLong").isValid).toBe(false);
  });

  it("rejette les mots de passe sans lettre", () => {
    expect(validatePassword("123456789").isValid).toBe(false);
  });

  it("valide les mots de passe conformes d'au moins 8 caractères avec lettre et chiffre", () => {
    const res = validatePassword("Zeyna2026");
    expect(res.isValid).toBe(true);
    expect(res.message).toBeUndefined();
  });
});
