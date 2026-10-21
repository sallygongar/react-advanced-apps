import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../lib/supabase";

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

    // Validamos que los campos obligatorios estén presentes
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: "Faltan datos obligatorios (email o code)",
      });
    }

    const { data: userData, error: userError } = await supabase
      .from("user")
      .upsert(
        {
          email,
          code,
          description,
          winningDegree,
          isWin,
          event_type,
          created_at: new Date(),
        },
        { onConflict: "email" },
      )
      .select("id")
      .single();

    if (userError) {
      throw userError;
    }

    if (userError) {
      throw userError;
    }

    const userId = userData.id;

    // PASO 2: Insertar el registro en la tabla de historial 'spins' (relacionando user_id y prize_id)
    const { data: spinData, error: spinError } = await supabase
      .from("spins")
      .insert([
        {
          user_id: userId,
          prize_id: prize_id,
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (spinError) {
      throw spinError;
    }

    return res.status(200).json({
      success: true,
      message: "Usuario y giro registrados exitosamente en el historial",
      winner: spinData,
    });
  } catch (error: any) {
    console.error("❌ Error al guardar el ganador:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
