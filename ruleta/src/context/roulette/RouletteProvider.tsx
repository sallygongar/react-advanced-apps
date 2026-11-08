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
import {
  fetchPrizes,
  fetchUserStatus,
  saveWinner,
} from "../../services/rouletteApi";

export const RouletteProvider = ({ children }: { children: ReactNode }) => {
  // Correo guardado al abrir la página (se lee una sola vez, nunca cambia)
  const [savedEmail] = useState<string>(
    () => readStorage<{ email?: string }>(STORAGE_KEY_EMAIL)?.email ?? "",
  );

  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rawPrizes, setRawPrizes] = useState<PromotionItem[]>([]);
  // Solo hay algo que verificar si existe un correo guardado
  const [loadingUser, setLoadingUser] = useState<boolean>(Boolean(savedEmail));
  const [loadingPrizes, setLoadingPrizes] = useState<boolean>(true);
  const [prizesAttempt, setPrizesAttempt] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>(savedEmail);
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

  // Verifica en el servidor al usuario guardado en localStorage (solo al montar)
  useEffect(() => {
    if (!savedEmail) return;

    let cancelled = false;

    fetchUserStatus(savedEmail)
      .then((data) => {
        if (cancelled) return;
        if (data.hasPlayed) {
          setPrize(data.prize);
          localStorage.setItem(
            STORAGE_KEY_EMAIL,
            JSON.stringify({ email: savedEmail }),
          );
        }
      })
      .catch((error) => {
        console.error("Error al verificar usuario:", error);
      })
      .finally(() => {
        if (!cancelled) setLoadingUser(false);
      });

    return () => {
      cancelled = true;
    };
  }, [savedEmail]);

  // Obtenemos los premios activos desde la API (y al reintentar)
  useEffect(() => {
    let cancelled = false;

    fetchPrizes()
      .then((prizes) => {
        if (!cancelled) setRawPrizes(prizes);
      })
      .catch((err) => {
        console.error("Error cargando premios:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPrizes(false);
      });

    return () => {
      cancelled = true;
    };
  }, [prizesAttempt]);

  // Vuelve a pedir los premios cuando falló la carga
  const retryLoadPrizes = () => {
    setError(null);
    setLoadingPrizes(true);
    setPrizesAttempt((n) => n + 1);
  };

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
        retryLoadPrizes,
      }}
    >
      {children}
    </RouletteContext.Provider>
  );
};
