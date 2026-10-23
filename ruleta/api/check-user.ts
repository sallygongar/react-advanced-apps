import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const currentEvent = process.env.ACTIVE_EVENT || "CYBER";

  if (req.method !== "GET" && req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Método no permitido" });
  }

  try {
    // Puedes recibir el email por query params o body
    const email =
      req.method === "GET" ? (req.query.email as string) : req.body.email;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "El email es obligatorio" });
    }

    // 1. Buscar al usuario por email
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userError) throw userError;

    // Si el usuario no existe en la BD, significa que nunca ha jugado
    if (!userData) {
      return res.status(200).json({ hasPlayed: false });
    }

    // 2. Buscar si tiene un giro registrado para este evento específico
    const { data: spinData, error: spinError } = await supabase
      .from("spins")
      .select("id, code, description, winningDegree, isWin, event_type")
      .eq("user_id", userData.id)
      .eq("event_type", currentEvent)
      .maybeSingle();

    if (spinError) throw spinError;

    if (spinData) {
      // Ya jugó: devolvemos sus datos de premio para mostrárselos en pantalla
      return res.status(200).json({
        hasPlayed: true,
        prize: {
          id: spinData.id,
          code: spinData.code,
          description: spinData.description,
          winningDegree: spinData.winningDegree,
          isWin: spinData.isWin,
          event_type: spinData.event_type,
          email,
        },
      });
    }

    // El usuario existe pero no ha jugado en este evento
    return res.status(200).json({ hasPlayed: false });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
