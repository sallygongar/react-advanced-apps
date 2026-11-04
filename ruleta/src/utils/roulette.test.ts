import { describe, it, expect } from "vitest";
import { calculateFinalRotation } from "./roulette";

describe("calculateFinalRotation", () => {
  it("calcula 5 vueltas más el ángulo hasta el ping (343°)", () => {
    // 343 - 22.5 = 320.5  →  5 * 360 + 320.5
    expect(calculateFinalRotation(22.5, 5)).toBe(2120.5);
  });

  it("no suma ángulo extra si el premio ya está en el ping", () => {
    expect(calculateFinalRotation(343, 5)).toBe(1800);
  });

  it("normaliza grados mayores a 360", () => {
    expect(calculateFinalRotation(382.5, 5)).toBe(
      calculateFinalRotation(22.5, 5),
    );
  });

  it("usa 1 vuelta mínima cuando extraLaps es 0", () => {
    expect(calculateFinalRotation(22.5, 0)).toBe(680.5);
  });

  it("usa 5 vueltas por defecto", () => {
    expect(calculateFinalRotation(22.5)).toBe(calculateFinalRotation(22.5, 5));
  });

  it("el ángulo extra siempre queda dentro de [0, 360)", () => {
    for (let degree = 0; degree < 360; degree += 22.5) {
      const extra = calculateFinalRotation(degree, 5) - 5 * 360;
      expect(extra).toBeGreaterThanOrEqual(0);
      expect(extra).toBeLessThan(360);
    }
  });
});
