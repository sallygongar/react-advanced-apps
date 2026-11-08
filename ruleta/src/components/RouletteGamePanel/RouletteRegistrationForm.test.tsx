import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RouletteRegistrationForm from "./RouletteRegistrationForm"; // ← ajusta si tu archivo se llama distinto
import { useRouletteForm } from "../../context/form/useFormContext";

// Reemplazamos el hook real por uno falso para controlar el estado en cada test
vi.mock("../../context/form/useFormContext", () => ({
  useRouletteForm: vi.fn(),
}));

// Valores por defecto: formulario en reposo. Cada test cambia solo lo que necesita.
const mockForm = (overrides = {}) => {
  const form = {
    inputs: { email: "" },
    errors: {},
    acceptedTerms: false,
    isPlaying: false,
    isVerifying: false,
    onTermsChange: vi.fn(),
    onInputChange: vi.fn(),
    onValidateForm: vi.fn(() => true),
    playRoulette: vi.fn(),
    ...overrides,
  };
  vi.mocked(useRouletteForm).mockReturnValue(form as never);
  return form;
};

describe("RouletteRegistrationForm: estados del botón", () => {
  it("muestra 'Jugar' y está habilitado en reposo", () => {
    mockForm();
    render(<RouletteRegistrationForm />);

    expect(screen.getByRole("button", { name: "Jugar" })).toBeEnabled();
  });

  it("muestra 'Verificando...' y se deshabilita mientras verifica", () => {
    mockForm({ isVerifying: true });
    render(<RouletteRegistrationForm />);

    expect(
      screen.getByRole("button", { name: "Verificando..." }),
    ).toBeDisabled();
  });

  it("muestra 'Jugando...' y se deshabilita mientras gira", () => {
    mockForm({ isPlaying: true });
    render(<RouletteRegistrationForm />);

    expect(screen.getByRole("button", { name: "Jugando..." })).toBeDisabled();
  });
});

describe("RouletteRegistrationForm: envío", () => {
  it("llama a playRoulette si el formulario es válido", async () => {
    const form = mockForm({ onValidateForm: vi.fn(() => true) });
    render(<RouletteRegistrationForm />);

    await userEvent.click(screen.getByRole("button", { name: "Jugar" }));

    expect(form.onValidateForm).toHaveBeenCalledTimes(1);
    expect(form.playRoulette).toHaveBeenCalledTimes(1);
  });

  it("NO llama a playRoulette si el formulario no es válido", async () => {
    const form = mockForm({ onValidateForm: vi.fn(() => false) });
    render(<RouletteRegistrationForm />);

    await userEvent.click(screen.getByRole("button", { name: "Jugar" }));

    expect(form.onValidateForm).toHaveBeenCalledTimes(1);
    expect(form.playRoulette).not.toHaveBeenCalled();
  });

  it("no hace nada al hacer clic mientras está verificando", async () => {
    const form = mockForm({ isVerifying: true });
    render(<RouletteRegistrationForm />);

    await userEvent.click(
      screen.getByRole("button", { name: "Verificando..." }),
    );

    expect(form.onValidateForm).not.toHaveBeenCalled();
    expect(form.playRoulette).not.toHaveBeenCalled();
  });
});

describe("RouletteRegistrationForm: errores y campos", () => {
  it("muestra los mensajes de error del correo y de los términos", () => {
    mockForm({
      errors: { email: "Correo inválido", terms: "Debes aceptar los términos" },
    });
    render(<RouletteRegistrationForm />);

    expect(screen.getByText("Correo inválido")).toBeInTheDocument();
    expect(screen.getByText("Debes aceptar los términos")).toBeInTheDocument();
    expect(screen.getByAltText("Advertencia")).toBeInTheDocument();
  });

  it("no muestra el banner de error cuando no hay errores", () => {
    mockForm({ errors: {} });
    render(<RouletteRegistrationForm />);

    expect(screen.queryByAltText("Advertencia")).not.toBeInTheDocument();
  });

  it("llama a onInputChange al escribir en el campo de correo", async () => {
    const form = mockForm();
    render(<RouletteRegistrationForm />);

    await userEvent.type(screen.getByPlaceholderText("Ingresa tu correo"), "a");

    expect(form.onInputChange).toHaveBeenCalled();
  });
});
