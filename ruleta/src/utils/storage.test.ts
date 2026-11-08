import { describe, it, expect, beforeEach } from "vitest";
import { readStorage, persistResult } from "./storage";
import { STORAGE_KEY, STORAGE_KEY_EMAIL } from "../constants/roulette";
import type { PrizeData } from "../types/wheel";

describe("readStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("devuelve el objeto parseado cuando la clave existe", () => {
    localStorage.setItem("test", JSON.stringify({ email: "a@b.com" }));

    expect(readStorage<{ email: string }>("test")).toEqual({
      email: "a@b.com",
    });
  });

  it("devuelve null si la clave no existe", () => {
    expect(readStorage("no-existe")).toBeNull();
  });

  it("devuelve null si el JSON está corrupto, sin lanzar error", () => {
    localStorage.setItem("test", "{texto roto");

    expect(readStorage("test")).toBeNull();
  });
});

describe("persistResult", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("guarda el premio y el correo en sus claves", () => {
    const prize = { code: "10OFF", winningDegree: 22.5 } as PrizeData;

    persistResult(prize, "a@b.com");

    expect(readStorage(STORAGE_KEY)).toEqual(prize);
    expect(readStorage(STORAGE_KEY_EMAIL)).toEqual({ email: "a@b.com" });
  });
});
