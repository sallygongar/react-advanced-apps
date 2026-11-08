import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { RouletteProvider } from "./RouletteProvider";
import { useRouletteHook } from "./useRouletteHook";
import {
  fetchPrizes,
  fetchUserStatus,
  saveWinner,
} from "../../services/rouletteApi";
import {
  SPIN_DURATION,
  STORAGE_KEY,
  STORAGE_KEY_EMAIL,
} from "../../constants/roulette";

// Reemplazamos el servicio de API: ningún test hace peticiones reales
vi.mock("../../services/rouletteApi", () => ({
  fetchPrizes: vi.fn(),
  fetchUserStatus: vi.fn(),
  saveWinner: vi.fn(),
}));

const PRIZES = [
  {
    id: 1,
    code: "WIN10",
    description: "*10%*\noff",
    isWin: true,
    event_type: "CYBER",
  },
  {
    id: 2,
    code: "TRYAGAIN",
    description: "*Sigue*\nintentando",
    isWin: false,
    event_type: "CYBER",
  },
];

beforeEach(() => {
  localStorage.clear();
  // Estado por defecto: premios cargan bien y el usuario no ha jugado
  vi.mocked(fetchPrizes)
    .mockReset()
    .mockResolvedValue(PRIZES as never);
  vi.mocked(fetchUserStatus)
    .mockReset()
    .mockResolvedValue({ hasPlayed: false });
  vi.mocked(saveWinner).mockReset().mockResolvedValue(undefined);
  // Silenciamos console.error: el provider lo usa al manejar errores
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <RouletteProvider>{children}</RouletteProvider>
);

// Dibuja el provider y espera a que termine de cargar (con éxito o con error)
const renderProvider = async () => {
  const hook = renderHook(() => useRouletteHook(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

// Deja la ruleta girando: fuerza el primer premio y activa temporizadores falsos
const startSpin = async () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  const hook = await renderProvider();

  act(() => {
    hook.result.current.setUserEmail?.("a@b.com");
  });

  // Se activan DESPUÉS de cargar, porque waitFor necesita temporizadores reales
  vi.useFakeTimers();
  await act(async () => {
    await hook.result.current.playRoulette?.();
  });

  return hook;
};

describe("RouletteProvider: carga de premios", () => {
  it("carga los premios y calcula el ángulo de cada segmento", async () => {
    const { result } = await renderProvider();

    expect(result.current.error).toBeNull();
    expect(result.current.promotions).toHaveLength(2);
    // 2 premios → segmentos de 180°, centros en 90° y 270°
    expect(result.current.promotions?.map((p) => p.grade)).toEqual([90, 270]);
    expect(result.current.promotions?.map((p) => p.range)).toEqual([
      [0, 180],
      [180, 360],
    ]);
  });

  it("guarda el error y deja de cargar cuando fallan los premios", async () => {
    vi.mocked(fetchPrizes).mockRejectedValue(new Error("Failed to fetch"));
    const { result } = await renderProvider();

    expect(result.current.error).toBe("Failed to fetch");
    expect(result.current.loading).toBe(false);
    expect(result.current.promotions).toEqual([]);
  });

  it("retryLoadPrizes vuelve a pedir los premios y limpia el error", async () => {
    vi.mocked(fetchPrizes).mockRejectedValueOnce(new Error("Failed to fetch"));
    const { result } = await renderProvider();
    expect(result.current.error).toBe("Failed to fetch");

    act(() => {
      result.current.retryLoadPrizes?.();
    });

    await waitFor(() => expect(result.current.promotions).toHaveLength(2));
    expect(result.current.error).toBeNull();
    expect(fetchPrizes).toHaveBeenCalledTimes(2);
  });
});

describe("RouletteProvider: usuario guardado", () => {
  it("sin correo guardado no consulta al servidor", async () => {
    await renderProvider();

    expect(fetchUserStatus).not.toHaveBeenCalled();
  });

  it("con correo guardado lo verifica una sola vez", async () => {
    localStorage.setItem(
      STORAGE_KEY_EMAIL,
      JSON.stringify({ email: "a@b.com" }),
    );
    const { result, rerender } = await renderProvider();

    rerender(); // un render extra no debe repetir la consulta (el bucle de antes)

    expect(fetchUserStatus).toHaveBeenCalledTimes(1);
    expect(fetchUserStatus).toHaveBeenCalledWith("a@b.com");
    expect(result.current.email).toBe("a@b.com");
  });

  it("si el usuario ya jugó, restaura su premio", async () => {
    const savedPrize = {
      id: 5,
      code: "OLD10",
      description: "*10%*",
      isWin: true,
      winningDegree: 90,
    };
    localStorage.setItem(
      STORAGE_KEY_EMAIL,
      JSON.stringify({ email: "a@b.com" }),
    );
    vi.mocked(fetchUserStatus).mockResolvedValue({
      hasPlayed: true,
      prize: savedPrize,
    });

    const { result } = await renderProvider();

    expect(result.current.prize).toEqual(savedPrize);
    expect(result.current.isFinished).toBe(true);
  });
});

describe("RouletteProvider: jugar", () => {
  it("isSpinning se mantiene activo hasta que termina el giro", async () => {
    const { result } = await startSpin();

    // Recién empezó: gira, sin premio todavía
    expect(result.current.isVerifying).toBe(false);
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isSpinning).toBe(true);
    expect(result.current.prize).toBeNull();
    // Primer premio: 90° → 5 vueltas (1800°) + (343 - 90) = 2053°
    expect(result.current.rotationDegree).toBe(2053);

    // Un milisegundo antes del final sigue girando
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION - 1);
    });
    expect(result.current.isSpinning).toBe(true);

    // Al cumplirse el tiempo, termina
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isSpinning).toBe(false);
    expect(result.current.isPlaying).toBe(false);
  });

  it("al terminar el giro muestra el premio y lo guarda", async () => {
    const { result } = await startSpin();

    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION);
    });

    expect(result.current.prize).toMatchObject({
      code: "WIN10",
      isWin: true,
      email: "a@b.com",
    });
    expect(result.current.isFinished).toBe(true);
    expect(saveWinner).toHaveBeenCalledWith(
      expect.objectContaining({ code: "WIN10" }),
      "a@b.com",
    );
    expect(localStorage.getItem(STORAGE_KEY_EMAIL)).toBe(
      JSON.stringify({ email: "a@b.com" }),
    );
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").code).toBe(
      "WIN10",
    );
  });

  it("si el correo ya jugó, avisa y restaura su premio sin girar", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const oldPrize = {
      id: 9,
      code: "OLD10",
      description: "*10%*",
      isWin: true,
      winningDegree: 90,
    };
    vi.mocked(fetchUserStatus).mockResolvedValue({
      hasPlayed: true,
      prize: oldPrize,
    });
    const { result } = await renderProvider();

    act(() => {
      result.current.setUserEmail?.("a@b.com");
    });
    await act(async () => {
      await result.current.playRoulette?.();
    });

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(result.current.prize).toEqual(oldPrize);
    expect(result.current.isFinished).toBe(true);
    expect(result.current.isSpinning).toBe(false);
    expect(result.current.isVerifying).toBe(false);
    expect(saveWinner).not.toHaveBeenCalled();
  });

  it("no gira si los premios no se cargaron", async () => {
    vi.mocked(fetchPrizes).mockRejectedValue(new Error("down"));
    const { result } = await renderProvider();

    act(() => {
      result.current.setUserEmail?.("a@b.com");
    });
    await act(async () => {
      await result.current.playRoulette?.();
    });

    expect(fetchUserStatus).not.toHaveBeenCalled();
    expect(result.current.isSpinning).toBe(false);
  });

  it("si falla la verificación, apaga todos los estados y no guarda nada", async () => {
    vi.mocked(fetchUserStatus).mockRejectedValue(new Error("down"));
    const { result } = await renderProvider();

    act(() => {
      result.current.setUserEmail?.("a@b.com");
    });
    await act(async () => {
      await result.current.playRoulette?.();
    });

    expect(result.current.isVerifying).toBe(false);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isSpinning).toBe(false);
    expect(saveWinner).not.toHaveBeenCalled();
  });
});

describe("useRouletteHook", () => {
  it("lanza un error si se usa fuera del RouletteProvider", () => {
    expect(() => renderHook(() => useRouletteHook())).toThrow(
      /must be used within/,
    );
  });
});
