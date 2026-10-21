import { type ReactNode, useEffect, useMemo, useState } from "react";
import RouletteContext from "./RouletteContext";
import type { PromotionItem, PrizeData } from "../../types/wheel";

const STORAGE_KEY = "roulette_prize_result";

export const RouletteProvider = ({ children }: { children: ReactNode }) => {
  const [colors, setColors] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rawPrizes, setRawPrizes] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

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

  // 1. Obtenemos los premios activos desde la API al cargar el componente
  useEffect(() => {
    setLoading(true);

    // Puedes cambiar 'CYBER' por una variable si la manejas dinámicamente
    fetch("/api/prizes?eventType=CYBER")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener la lista de premios");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setRawPrizes(data.prizes);
        } else {
          setError(data.error || "No se pudieron cargar los premios");
        }
      })
      .catch((err) => {
        console.error("❌ Error cargando premios:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setColors(["#fff", "#37BAED"]); // 37BAED  ,175C1D
  }, []);

  const promotions: PromotionItem[] = useMemo(() => {
    const total = rawPrizes.length;
    if (total === 0) return [];

    const segmentAngle = 360 / total;

    return rawPrizes.map((item, index) => {
      const startDegree = index * segmentAngle;
      const endDegree = startDegree + segmentAngle;
      const centerDegree = startDegree + segmentAngle / 2;

      return {
        ...item,
        range: [startDegree, endDegree],
        grade: centerDegree,
      };
    });
  }, [rawPrizes]);

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
      id: selectedPromotion?.id,
      isWin: selectedPromotion?.isWin,
      code: selectedPromotion?.code,
      description: selectedPromotion?.description,
      winningDegree: selectedPromotion?.grade,
      event_type: selectedPromotion?.event_type,
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

      (async () => {
        try {
          const response = await fetch("/api/save-winner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              code: resultPrize.code,
              description: resultPrize.description,
              winningDegree: resultPrize.winningDegree,
              isWin: resultPrize.isWin,
              prize_id: resultPrize.id,
              event_type: resultPrize.event_type,
            }),
          });

          const data = await response.json();
          if (data.success) {
            console.log(
              "🎉 ¡Ganador guardado con éxito en Supabase!",
              data.winner,
            );
          } else {
            console.error("❌ Error al guardar en Supabase:", data.error);
          }
        } catch (error) {
          console.error("❌ Error de red al intentar guardar:", error);
        }
      })();
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
        loading,
        error,
        email: userEmail,
        setUserEmail,
        playRoulette,
      }}
    >
      {children}
    </RouletteContext.Provider>
  );
};
