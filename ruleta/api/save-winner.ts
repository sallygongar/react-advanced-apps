import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./lib/supabase.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitimos peticiones POST para guardar registros
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Método no permitido" });
  }

  try {
    // Recibimos los datos del usuario y el premio desde el frontend

    const {
      email,
      code,
      description,
      winningDegree,
      isWin,
      prize_id,
      event_type,
    } = req.body;

    const currentEvent = event_type || "CYBER";

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: "Faltan datos obligatorios (email o code)",
      });
    }

    // Asegurar que el usuario exista en la tabla 'user' y obtener su ID
    const { data: userData, error: userError } = await supabase
      .from("user")
      .upsert({ email }, { onConflict: "email" })
      .select("id")
      .single();

    if (userError) throw userError;
    const userId = userData.id;

    // Validar si el usuario YA JUGÓ en este evento específico
    const { data: existingSpin, error: checkError } = await supabase
      .from("spins")
      .select("id")
      .eq("user_id", userId)
      .eq("event_type", currentEvent)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingSpin) {
      return res.status(400).json({
        success: false,
        error: "Ya has participado en este evento. ¡Espera al siguiente!",
      });
    }

    //Registrar el nuevo giro y premio en la tabla 'spins'
    const { data: spinData, error: spinError } = await supabase
      .from("spins")
      .insert([
        {
          user_id: userId,
          prize_id: prize_id,
          code,
          description,
          winningDegree,
          isWin,
          event_type,
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (spinError) throw spinError;

    return res.status(200).json({
      success: true,
      message: "Premio registrado exitosamente en el historial",
      winner: spinData,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
