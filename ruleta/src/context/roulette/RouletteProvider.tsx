import { type ReactNode, useEffect, useMemo, useState } from "react";
import RouletteContext from "./RouletteContext";
import type { PromotionItem, PrizeData } from "../../types/wheel";
import promotionsList from "../../data/promotions.json";

const STORAGE_KEY = "roulette_prize_result";

export const RouletteProvider = ({ children }: { children: ReactNode }) => {
  const [colors, setColors] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const [prize, setPrize] = useState<PrizeData | null>(() => {
    const savedPrize = localStorage.getItem(STORAGE_KEY);
    return savedPrize ? JSON.parse(savedPrize) : null;
  });

  const [isFinished, setIsFinished] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  });

  const [rotationDegree, setRotationDegree] = useState<number>(() => {
    const savedPrize = localStorage.getItem(STORAGE_KEY);
    if (savedPrize) {
      const prizeData: PrizeData = JSON.parse(savedPrize);
      if (prizeData.winningDegree !== undefined) {
        return calculateFinalRotation(prizeData.winningDegree, 0);
      }
    }
    return 0;
  });

  useEffect(() => {
    setColors(["#fff", "#37BAED"]); // 37BAED  ,175C1D
  }, []);

  const promotions: PromotionItem[] = useMemo(() => {
    const total = promotionsList.length;
    if (total === 0) return [];

    const segmentAngle = 360 / total;

    return promotionsList.map((item, index) => {
      const startDegree = index * segmentAngle;
      const endDegree = startDegree + segmentAngle;
      const centerDegree = startDegree + segmentAngle / 2;

      return {
        ...item,
        range: [startDegree, endDegree],
        grade: centerDegree,
      };
    });
  }, [promotionsList]);

  // Función auxiliar para calcular los grados de rotación
  function calculateFinalRotation(
    winningDegree: number,
    extraLaps = 5,
  ): number {
    // Posición angular exacta de la punta del ping (aprox. 343° / 345° según tu maquetación)
    const pingAngle = 343;

    // Calcula el ángulo necesario para que 'winningDegree' llegue a la punta del ping
    const targetDegree = (pingAngle - (winningDegree % 360) + 360) % 360;
    // Si extraLaps es 0 (al recargar), usamos 1 vuelta (360) para mantener la rotación positiva y completa
    const laps = extraLaps > 0 ? extraLaps : 1;
    return laps * 360 + targetDegree;
  }

  function playRoulette() {
    if (isSpinning || isFinished) return;
    setIsSpinning(true);
    const randomIndex = Math.floor(Math.random() * promotions.length);
    const selectedPromotion = promotions[randomIndex];

    const resultPrize: PrizeData = {
      isWin: selectedPromotion.isWin,
      code: selectedPromotion.code || "CUPON2026",
      description: selectedPromotion.description || "Premio obtenido",
      winningDegree: selectedPromotion.grade,
    };

    // 2. Calcular los grados finales de rotación (5 giros + ángulo del premio)
    const totalRotation = calculateFinalRotation(
      selectedPromotion.grade ?? 0,
      5,
    );
    setRotationDegree(totalRotation);

    // 3. Simular el tiempo de giro de la rueda (ejemplo: 4 segundos)
    setTimeout(() => {
      setPrize(resultPrize);
      setIsFinished(true);
      setIsSpinning(false);

      // Guardar en localStorage para que persista al recargar
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resultPrize));
    }, 4000);
  }

  return (
    <RouletteContext.Provider
      value={{
        promotions,
        colors,
        prize,
        isSpinning,
        isFinished,
        rotationDegree,
        playRoulette,
      }}
    >
      {children}
    </RouletteContext.Provider>
  );
};
