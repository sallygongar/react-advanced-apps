import type { PrizeData, PromotionItem } from "../types/wheel";

export const fetchPrizes = async (): Promise<PromotionItem[]> => {
  const response = await fetch("/api/prizes");
  if (!response.ok) throw new Error("Error al obtener la lista de premios");

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "No se pudieron cargar los premios");
  }
  if (!Array.isArray(data.prizes) || data.prizes.length === 0) {
    throw new Error("No hay premios disponibles");
  }
  return data.prizes;
};

export const fetchUserStatus = async (email: string) => {
  const response = await fetch(
    `/api/check-user?email=${encodeURIComponent(email)}`,
  );
  if (!response.ok) throw new Error("Error en la verificación del usuario");
  return response.json();
};

export const saveWinner = async (resultPrize: PrizeData, email: string) => {
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
