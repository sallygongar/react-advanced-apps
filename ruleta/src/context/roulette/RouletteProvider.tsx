import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import RouletteContext from "./RouletteContext";
import type { PromotionItem, PrizeData } from "../../types/wheel";

const STORAGE_KEY = "roulette_prize_result";
const STORAGE_KEY_EMAIL = "roulette_email";
const SPIN_DURATION = 4000;
const colors = ["#fff", "#37BAED"];

// ---------- Helpers (no dependen del componente) ----------
const calculateFinalRotation = (
  winningDegree: number,
  extraLaps = 5,
): number => {
  const pingAngle = 343;
  const targetDegree = (pingAngle - (winningDegree % 360) + 360) % 360;
  const laps = extraLaps > 0 ? extraLaps : 1;
  return laps * 360 + targetDegree;
};

const readStorage = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const persistResult = (prize: PrizeData, email: string) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prize));
  localStorage.setItem(STORAGE_KEY_EMAIL, JSON.stringify({ email }));
};

const fetchUserStatus = async (email: string) => {
  const response = await fetch(
    `/api/check-user?email=${encodeURIComponent(email)}`,
  );
  if (!response.ok) throw new Error("Error en la verificación del usuario");
  return response.json();
};

const saveWinner = async (resultPrize: PrizeData, email: string) => {
  try {
    const response = await fetch("/api/save-winner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
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
      console.log("🎉 ¡Ganador guardado con éxito en Supabase!", data.winner);
    } else {
      console.error("Error al guardar en Supabase:", data.error);
    }
  } catch (error) {
    console.error("Error de red al intentar guardar:", error);
  }
};

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
    if (isSpinning || isFinished || promotions.length === 0) return;

    try {
      // 1. Verificamos en el servidor si ya jugó antes de iniciar la animación
      setIsPlaying(true);
      const dataCheck = await fetchUserStatus(userEmail);

      if (dataCheck.hasPlayed) {
        alert("¡Ya has participado en este evento con este correo!");
        setPrize(dataCheck.prize);
        setIsFinished(true);
        persistResult(dataCheck.prize, userEmail);
        setIsPlaying(false);
        return;
      }

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
    } finally {
      setIsSpinning(false);
      setIsPlaying(false);
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
