import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import RouletteContext from "./RouletteContext";
import type { PromotionItem, PrizeData } from "../../types/wheel";
import {
  SPIN_DURATION,
  STORAGE_KEY,
  STORAGE_KEY_EMAIL,
  colors,
} from "../../constants/roulette";
import { calculateFinalRotation } from "../../utils/roulette";
import { readStorage, persistResult } from "../../utils/storage";
import { fetchUserStatus, saveWinner } from "../../services/rouletteApi";

export const RouletteProvider = ({ children }: { children: ReactNode }) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rawPrizes, setRawPrizes] = useState<PromotionItem[]>([]);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingPrizes, setLoadingPrizes] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [prize, setPrize] = useState<PrizeData | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(
    () => readStorage(STORAGE_KEY_EMAIL) !== null,
  );
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [rotationDegree, setRotationDegree] = useState<number>(() => {
    const savedPrize = readStorage<PrizeData>(STORAGE_KEY);
    return savedPrize?.winningDegree !== undefined
      ? calculateFinalRotation(savedPrize.winningDegree, 0)
      : 0;
  });

  const spinTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loading = loadingUser || loadingPrizes;

  // Limpia el timer si el componente se desmonta durante el giro
  useEffect(() => {
    return () => {
      if (spinTimeout.current) clearTimeout(spinTimeout.current);
    };
  }, []);

  useEffect(() => {
    // Función para consultar el endpoint del backend
    const checkUserInDatabase = async (email: string) => {
      try {
        const data = await fetchUserStatus(email);
        if (data.hasPlayed) {
          setPrize(data.prize);
          localStorage.setItem(STORAGE_KEY_EMAIL, JSON.stringify({ email }));
        } else {
          setPrize(null);
        }
      } catch (error) {
        console.error("Error al verificar usuario:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    const saved = readStorage<{ email?: string }>(STORAGE_KEY_EMAIL);
    if (saved?.email) {
      setUserEmail(saved.email);
      checkUserInDatabase(saved.email);
      return;
    }
    setPrize(null);
    setLoadingUser(false);
  }, []);

  // Obtenemos los premios activos desde la API al cargar el componente
  useEffect(() => {
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
      .finally(() => setLoadingPrizes(false));
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
    if (isSpinning || isPlaying || isFinished || promotions.length === 0)
      return;

    try {
      // 1. Verificamos en el servidor si ya jugó antes de iniciar la animación
      setIsVerifying(true);
      const dataCheck = await fetchUserStatus(userEmail);

      if (dataCheck.hasPlayed) {
        alert("¡Ya has participado en este evento con este correo!");
        setPrize(dataCheck.prize);
        setIsFinished(true);
        persistResult(dataCheck.prize, userEmail);
        setIsVerifying(false);
        return;
      }

      setIsVerifying(false);
      setIsPlaying(true);
      setIsSpinning(true);

      const selectedPromotion =
        promotions[Math.floor(Math.random() * promotions.length)];

      const resultPrize: PrizeData = {
        id: selectedPromotion.id,
        email: userEmail,
        isWin: selectedPromotion.isWin,
        code: selectedPromotion.code,
        description: selectedPromotion.description,
        winningDegree: selectedPromotion.grade,
        event_type: selectedPromotion.event_type,
      };

      // 2. Grados finales de rotación (5 giros + ángulo del premio)
      setRotationDegree(
        calculateFinalRotation(selectedPromotion.grade ?? 0, 5),
      );

      // 3. Al terminar el giro, mostramos y guardamos el resultado
      spinTimeout.current = setTimeout(() => {
        setPrize(resultPrize);
        setIsFinished(true);
        setIsSpinning(false);
        setIsPlaying(false);
        persistResult(resultPrize, userEmail);
        saveWinner(resultPrize, userEmail);
      }, SPIN_DURATION);
    } catch (error) {
      console.error("Error al verificar estatus antes de girar:", error);
      setIsSpinning(false);
      setIsPlaying(false);
      setIsVerifying(false);
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
        isPlaying,
        isVerifying,
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
