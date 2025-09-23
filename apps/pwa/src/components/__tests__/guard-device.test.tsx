import { render, screen } from "@testing-library/react";
import { Guard } from "../guard-device";

vi.mock("@uidotdev/usehooks", () => {
  return {
    useMediaQuery: vi.fn(),
  };
});

import { useMediaQuery } from "@uidotdev/usehooks";
import { vi } from "vitest";

describe("Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setQueries(values: Record<string, boolean>) {
    (useMediaQuery as unknown as jest.Mock).mockImplementation(
      (q: string) => values[q] ?? false,
    );
  }

  test("shows QR screen on desktop (wide and not touch) when not standalone", () => {
    setQueries({
      "(hover: none) and (pointer: coarse)": false,
      "(any-hover: none) and (any-pointer: coarse)": false,
      "(min-width: 64em)": true, // wide
      "(orientation: landscape)": false,
      "(display-mode: standalone)": false,
      "screen and (display-mode: standalone)": false,
    });

    render(<Guard isProd={true}>content</Guard>);
    expect(
      screen.getByText(/optimized for mobile and tablet devices/i),
    ).toBeInTheDocument();
  });

  test("renders children on touch portrait mode", () => {
    setQueries({
      "(hover: none) and (pointer: coarse)": true,
      "(any-hover: none) and (any-pointer: coarse)": true,
      "(min-width: 64em)": true, // still wide but touch
      "(orientation: landscape)": false, // portrait
      "(display-mode: standalone)": false,
      "screen and (display-mode: standalone)": false,
    });

    render(<Guard isProd={true}>content</Guard>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  test("asks to rotate on landscape touch", () => {
    setQueries({
      "(hover: none) and (pointer: coarse)": true,
      "(any-hover: none) and (any-pointer: coarse)": true,
      "(min-width: 64em)": false,
      "(orientation: landscape)": true,
      "(display-mode: standalone)": false,
      "screen and (display-mode: standalone)": false,
    });

    render(<Guard isProd={true}>content</Guard>);
    expect(
      screen.getByText(/rotate your device to portrait/i),
    ).toBeInTheDocument();
  });
});
