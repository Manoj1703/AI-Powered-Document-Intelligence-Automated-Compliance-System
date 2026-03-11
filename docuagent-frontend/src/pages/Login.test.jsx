import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Login from "./Login";

describe("Login captcha flow", () => {
  it("requires captcha token when site key is configured", async () => {
    const onLogin = vi.fn().mockResolvedValue({ justRegistered: false });

    render(<Login onLogin={onLogin} turnstileSiteKeyOverride="test-site-key" />);

    fireEvent.change(screen.getByLabelText(/Email or Username/i), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "Admin@123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^Login$/i }));

    expect(await screen.findByText(/Please complete the captcha challenge\./i)).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("shows captcha configuration warning when key is missing", () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} turnstileSiteKeyOverride="" />);

    expect(screen.getByText(/Captcha is not configured\./i)).toBeInTheDocument();
  });
});
