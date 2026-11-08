import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RouletteNoPrizeCard from "./RouletteNoPrizeCard";

describe("RouletteNoPrizeCard", () => {
  it("muestra el título", () => {
    render(<RouletteNoPrizeCard />);

    expect(
      screen.getByRole("heading", { name: "¡Esta vez no fue posible!" }),
    ).toBeInTheDocument();
  });

  it("muestra el mensaje motivador", () => {
    render(<RouletteNoPrizeCard />);

    expect(
      screen.getByText("Pero todavía te esperan muchas ofertas"),
    ).toBeInTheDocument();
  });

  it("muestra la imagen con su texto alternativo", () => {
    render(<RouletteNoPrizeCard />);

    expect(screen.getByAltText("Sigue Participando")).toBeInTheDocument();
  });

  it("muestra un enlace 'Ver Productos' que apunta a la tienda", () => {
    render(<RouletteNoPrizeCard />);

    expect(screen.getByRole("link", { name: "Ver Productos" })).toHaveAttribute(
      "href",
      "https://sallygongar-ecommerce.vercel.app/",
    );
  });
});
