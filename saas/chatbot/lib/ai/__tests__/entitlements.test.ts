import { describe, expect, it } from "vitest";
import { entitlementsByUserType } from "../entitlements";

describe("entitlementsByUserType", () => {
  it("guest has maxMessagesPerDay of 20", () => {
    expect(entitlementsByUserType.guest.maxMessagesPerDay).toBe(20);
  });

  it("regular has maxMessagesPerDay of 50", () => {
    expect(entitlementsByUserType.regular.maxMessagesPerDay).toBe(50);
  });

  it("all tiers have positive integer maxMessagesPerDay", () => {
    for (const [, entitlements] of Object.entries(entitlementsByUserType)) {
      expect(entitlements.maxMessagesPerDay).toBeGreaterThan(0);
      expect(Number.isInteger(entitlements.maxMessagesPerDay)).toBe(true);
    }
  });

  it("guest limit is less than regular limit", () => {
    expect(entitlementsByUserType.guest.maxMessagesPerDay).toBeLessThan(
      entitlementsByUserType.regular.maxMessagesPerDay
    );
  });
});
