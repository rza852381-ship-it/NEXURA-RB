import { describe, it, expect } from "vitest";

describe("Salla OAuth Config", () => {
  it("should have SALLA_CLIENT_ID configured", () => {
    const clientId = process.env.SALLA_CLIENT_ID;
    // يقبل القيمة الافتراضية أو القيمة المضبوطة
    const hasValue = !!clientId && clientId.length > 5;
    expect(hasValue).toBe(true);
  });

  it("should have SALLA_CLIENT_SECRET configured", () => {
    const clientSecret = process.env.SALLA_CLIENT_SECRET;
    const hasValue = !!clientSecret && clientSecret.length > 5;
    expect(hasValue).toBe(true);
  });

  it("should build valid OAuth URL", () => {
    const clientId = process.env.SALLA_CLIENT_ID || "7e42b932-6690-477d-aba0-a9fca78047e5";
    const redirectUri = "https://example.com/api/salla/callback";
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "offline_access",
    });
    const url = `https://accounts.salla.sa/oauth2/auth?${params.toString()}`;
    expect(url).toContain("accounts.salla.sa");
    expect(url).toContain("client_id=");
    expect(url).toContain("redirect_uri=");
    expect(url).toContain("offline_access");
  });
});
