import { describe, expect, it } from "vitest";
import { getDashboardPathByRole, isAllowedRole } from "./permissions";

describe("permissions", () => {
  it("returns the correct dashboard path for each role", () => {
    expect(getDashboardPathByRole("admin")).toBe("/admin");
    expect(getDashboardPathByRole("bailleur")).toBe("/bailleur");
    expect(getDashboardPathByRole("etudiant")).toBe("/etudiant");
  });

  it("allows only the configured roles", () => {
    expect(isAllowedRole("admin", ["admin", "bailleur"])).toBe(true);
    expect(isAllowedRole("etudiant", ["admin", "bailleur"])).toBe(false);
    expect(isAllowedRole("bailleur", ["etudiant"])).toBe(false);
  });
});
