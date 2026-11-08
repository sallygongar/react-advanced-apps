import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RouletteWinnerCard from "./RouletteWinnerCard";

describe("RouletteWinnerCard: contenido", () => {
  it("muestra el título y la imagen de felicitación", () => {
    render(<RouletteWinnerCard />);

    expect(
      screen.getByRole("heading", { name: "¡Felicidades!" }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Felicidades")).toBeInTheDocument();
  });

  it("muestra el código y las líneas de la descripción recibidos por props", () => {
    render(
      <RouletteWinnerCard
        code="12HAMBURGUESA"
        description={"*12%*\nHamburguesa\n*Especial*"}
      />,
    );

    expect(screen.getByText("12HAMBURGUESA")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
    expect(screen.getByText("Hamburguesa")).toBeInTheDocument();
    expect(screen.getByText("Especial")).toBeInTheDocument();
  });

  it("quita los asteriscos del formato de la descripción", () => {
    render(<RouletteWinnerCard description={"*30%*\nen pañales\n*Huggies*"} />);

    expect(screen.queryByText(/\*/)).not.toBeInTheDocument();
  });

  it("usa el código por defecto cuando no recibe props", () => {
    render(<RouletteWinnerCard />);

    expect(screen.getByText("HNKIOLNDSDY")).toBeInTheDocument();
  });

  it("muestra un enlace 'Ver Productos' que apunta a la tienda", () => {
    render(<RouletteWinnerCard />);

    expect(screen.getByRole("link", { name: "Ver Productos" })).toHaveAttribute(
      "href",
      "https://sallygongar-ecommerce.vercel.app/",
    );
  });
});

describe("RouletteWinnerCard: copiar cupón", () => {
  it("no muestra '¡Copiado!' al inicio", () => {
    render(<RouletteWinnerCard />);

    expect(screen.queryByText("¡Copiado!")).not.toBeInTheDocument();
  });

  it("copia el código al portapapeles y muestra '¡Copiado!'", async () => {
    const user = userEvent.setup();
    render(<RouletteWinnerCard code="12HAMBURGUESA" />);

    await user.click(screen.getByRole("button", { name: "Copiar" }));

    expect(await screen.findByText("¡Copiado!")).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe("12HAMBURGUESA");
  });

  it("oculta '¡Copiado!' después de 2 segundos", async () => {
    const user = userEvent.setup();
    render(<RouletteWinnerCard />);

    await user.click(screen.getByRole("button", { name: "Copiar" }));
    expect(await screen.findByText("¡Copiado!")).toBeInTheDocument();

    await waitFor(
      () => expect(screen.queryByText("¡Copiado!")).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
