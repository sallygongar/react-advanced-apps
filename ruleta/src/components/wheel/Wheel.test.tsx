import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Wheel from "./Wheel";
import { useRouletteHook } from "../../context/roulette/useRouletteHook";

// Reemplazamos el hook real por uno falso para controlar el estado
vi.mock("../../context/roulette/useRouletteHook", () => ({
  useRouletteHook: vi.fn(),
}));

beforeEach(() => {
  // jsdom no implementa canvas; lo simulamos para evitar ruido en consola
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

// Estado por defecto: ruleta cargada y sin errores. Cada test cambia solo lo que necesita.
const mockWheel = (overrides = {}) => {
  const context = {
    promotions: [],
    colors: ["#fff", "#37BAED"],
    isSpinning: false,
    rotationDegree: 0,
    loading: false,
    error: null,
    retryLoadPrizes: vi.fn(),
    ...overrides,
  };
  vi.mocked(useRouletteHook).mockReturnValue(context as never);
  return context;
};

describe("Wheel: error al cargar los premios", () => {
  it("muestra un aviso accesible con el botón Reintentar", () => {
    mockWheel({ error: "Failed to fetch" });
    render(<Wheel />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No pudimos cargar la ruleta",
    );
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeEnabled();
  });

  it("no muestra al usuario el mensaje técnico del error", () => {
    mockWheel({ error: "Failed to fetch" });
    render(<Wheel />);

    expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument();
  });

  it("llama a retryLoadPrizes al pulsar Reintentar", async () => {
    const wheel = mockWheel({ error: "Failed to fetch" });
    render(<Wheel />);

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(wheel.retryLoadPrizes).toHaveBeenCalledTimes(1);
  });

  it("oculta el ping mientras hay error", () => {
    mockWheel({ error: "Failed to fetch" });
    render(<Wheel />);

    expect(screen.queryByAltText("ping")).not.toBeInTheDocument();
  });

  it("no muestra el aviso cuando todo va bien", () => {
    mockWheel();
    render(<Wheel />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByAltText("ping")).toBeInTheDocument();
  });
});
