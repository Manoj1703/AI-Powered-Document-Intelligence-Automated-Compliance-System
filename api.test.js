import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl } from "./api";

describe("resolveApiBaseUrl", () => {
  it("prefers the configured env value", () => {
    expect(resolveApiBaseUrl("https://api.example.com")).toBe("https://api.example.com");
  });

  it("uses the current browser hostname when no env value is provided", () => {
    expect(resolveApiBaseUrl("", { protocol: "http:", hostname: "13.62.128.112" })).toBe("http://13.62.128.112:8003");
  });

  it("falls back to localhost outside the browser", () => {
    expect(resolveApiBaseUrl("", null)).toBe("http://localhost:8003");
  });
});
