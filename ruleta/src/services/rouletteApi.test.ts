import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchPrizes } from "./rouletteApi";

// Simula la respuesta de fetch sin hacer ninguna petición real
const mockFetch = (response: { ok: boolean; json: () => Promise<unknown> }) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchPrizes", () => {
  it("llama a /api/prizes y devuelve la lista de premios", async () => {
    const prizes = [{ id: 1, code: "10OFF" }];
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ success: true, prizes }),
    });

    await expect(fetchPrizes()).resolves.toEqual(prizes);
    expect(fetchMock).toHaveBeenCalledWith("/api/prizes");
  });

  it("lanza un error si la respuesta no es ok", async () => {
    mockFetch({ ok: false, json: async () => ({}) });

    await expect(fetchPrizes()).rejects.toThrow(
      "Error al obtener la lista de premios",
    );
  });

  it("lanza el error de la API cuando success es false", async () => {
    mockFetch({
      ok: true,
      json: async () => ({ success: false, error: "Sin evento activo" }),
    });

    await expect(fetchPrizes()).rejects.toThrow("Sin evento activo");
  });

  it("lanza un mensaje por defecto cuando success es false sin error", async () => {
    mockFetch({ ok: true, json: async () => ({ success: false }) });

    await expect(fetchPrizes()).rejects.toThrow(
      "No se pudieron cargar los premios",
    );
  });

  it("lanza un error si la lista de premios está vacía", async () => {
    mockFetch({
      ok: true,
      json: async () => ({ success: true, prizes: [] }),
    });

    await expect(fetchPrizes()).rejects.toThrow("No hay premios disponibles");
  });

  it("lanza un error si prizes no es un arreglo", async () => {
    mockFetch({
      ok: true,
      json: async () => ({ success: true, prizes: null }),
    });

    await expect(fetchPrizes()).rejects.toThrow("No hay premios disponibles");
  });
});
