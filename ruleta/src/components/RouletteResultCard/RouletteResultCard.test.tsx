import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RouletteResultCard from "./RouletteResultCard";
import { useRouletteHook } from "../../context/roulette/useRouletteHook";

// Reemplazamos el hook real por uno falso para controlar el premio
vi.mock("../../context/roulette/useRouletteHook", () => ({
  useRouletteHook: vi.fn(),
}));

const mockPrize = (prize: unknown) => {
  vi.mocked(useRouletteHook).mockReturnValue({ prize } as never);
};

describe("RouletteResultCard", () => {
  it("muestra la tarjeta de ganador cuando isWin es true", () => {
    mockPrize({
      isWin: true,
      code: "12HAMBURGUESA",
      description: "*12%*\nHamburguesa\n*Especial*",
    });
    render(<RouletteResultCard />);

    expect(
      screen.getByRole("heading", { name: "¡Felicidades!" }),
    ).toBeInTheDocument();
  });

  it("no muestra la tarjeta de 'sin premio' cuando el usuario ganó", () => {
    mockPrize({ isWin: true, code: "12HAMBURGUESA", description: "*12%*" });
    render(<RouletteResultCard />);

    expect(
      screen.queryByRole("heading", { name: "¡Esta vez no fue posible!" }),
    ).not.toBeInTheDocument();
  });

  it("pasa el código y la descripción del premio a la tarjeta de ganador", () => {
    mockPrize({
      isWin: true,
      code: "12HAMBURGUESA",
      description: "*12%*\nHamburguesa\n*Especial*",
    });
    render(<RouletteResultCard />);

    expect(screen.getByText("12HAMBURGUESA")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
    expect(screen.getByText("Hamburguesa")).toBeInTheDocument();
  });

  it("muestra la tarjeta de 'sin premio' cuando isWin es false", () => {
    mockPrize({ isWin: false, code: "NOGANASTE", description: "*Sigue*" });
    render(<RouletteResultCard />);

    expect(
      screen.getByRole("heading", { name: "¡Esta vez no fue posible!" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "¡Felicidades!" }),
    ).not.toBeInTheDocument();
  });

  it("muestra la tarjeta de 'sin premio' cuando todavía no hay premio (null)", () => {
    mockPrize(null);
    render(<RouletteResultCard />);

    expect(
      screen.getByRole("heading", { name: "¡Esta vez no fue posible!" }),
    ).toBeInTheDocument();
  });
});
