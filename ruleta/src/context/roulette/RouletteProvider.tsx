import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import RouletteContext from "./RouletteContext";
import type { PromotionItem, PrizeData } from "../../types/wheel";

const STORAGE_KEY = "roulette_prize_result";
const STORAGE_KEY_EMAIL = "roulette_email";

export const RouletteProvider = ({ children }: { children: ReactNode }) => {
  const [colors, setColors] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rawPrizes, setRawPrizes] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [prize, setPrize] = useState<PrizeData | null>(null);

  // Función auxiliar para calcular los grados de rotación
  const calculateFinalRotation = useCallback(
    (winningDegree: number, extraLaps = 5): number => {
      const pingAngle = 343;
      const targetDegree = (pingAngle - (winningDegree % 360) + 360) % 360;
      const laps = extraLaps > 0 ? extraLaps : 1;
      return laps * 360 + targetDegree;
    },
    [],
  );

  const [isFinished, setIsFinished] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_EMAIL) !== null;
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

  // Función para consultar el endpoint del backend
  const checkUserInDatabase = async (email: string) => {
    try {
      const response = await fetch(
        `/api/check-user?email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();
      if (data.hasPlayed) {
        // Si ya jugó en Supabase, cargamos su premio real de la base de datos
        setPrize(data.prize);
        localStorage.setItem(STORAGE_KEY_EMAIL, JSON.stringify({ email }));
      } else {
        setPrize(null);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const dataStorage = localStorage.getItem(STORAGE_KEY_EMAIL);

    if (dataStorage) {
      try {
        const dataEmail = JSON.parse(dataStorage);
        if (dataEmail?.email) {
          setUserEmail(dataEmail.email);
          checkUserInDatabase(dataEmail.email);
          return;
        }
      } catch (e) {
        console.error("Error al parsear el email guardado:", e);
      }
    }
    setPrize(null);
    setLoading(false);
  }, [checkUserInDatabase]);

  // Obtenemos los premios activos desde la API al cargar el componente
  useEffect(() => {
    setLoading(true);

    // Puedes cambiar 'CYBER' por una variable si la manejas dinámicamente
    fetch("/api/prizes")
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
        console.error("Error cargando premios:", err);
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

  async function playRoulette() {
    if (isSpinning || isFinished) return;

    try {
      // 1. Verificamos en el servidor SI YA JUGÓ antes de iniciar la animación
      const responseCheck = await fetch(
        `/api/check-user?email=${encodeURIComponent(userEmail)}`,
      );

      if (!responseCheck.ok) throw new Error("Error en la verificación previa");

      const dataCheck = await responseCheck.json();

      if (dataCheck.hasPlayed) {
        // Si ya jugó, bloqueamos la ruleta inmediatamente y le mostramos su premio
        alert("¡Ya has participado en este evento con este correo!");
        setPrize(dataCheck.prize);
        setIsFinished(true);

        // Restauramos su localStorage para futuras recargas
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataCheck.prize));
        localStorage.setItem(
          STORAGE_KEY_EMAIL,
          JSON.stringify({ email: userEmail }),
        );
        return;
      }

      setIsSpinning(true);

      const randomIndex = Math.floor(Math.random() * promotions.length);
      const selectedPromotion = promotions[randomIndex];

      const resultPrize: PrizeData = {
        id: selectedPromotion?.id,
        email: userEmail,
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
      setTimeout(async () => {
        setPrize(resultPrize);
        setIsFinished(true);
        setIsSpinning(false);

        // Guardar en localStorage para que persista al recargar
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resultPrize));
        localStorage.setItem(
          STORAGE_KEY_EMAIL,
          JSON.stringify({ email: userEmail }),
        );

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
            console.error("Error al guardar en Supabase:", data.error);
          }
        } catch (error) {
          console.error("Error de red al intentar guardar:", error);
        }
      }, 4000);
    } catch (error) {
      console.error("Error al verificar estatus antes de girar:", error);
      setIsSpinning(false);
    }
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
