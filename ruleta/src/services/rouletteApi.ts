import type { PrizeData } from "../types/wheel";

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
