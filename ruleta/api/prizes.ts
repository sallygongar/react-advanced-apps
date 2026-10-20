import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Método no permitido" });
  }

  try {
    // 1. Extraemos el eventType de la URL (ej: /api/prizes?eventType=CYBER)
    const { eventType } = req.query;

    // 2. Iniciamos la consulta base asegurando que estén activos
    let query = supabase.from("prize").select("*").eq("is_active", true);

    // 3. Si mandan un eventType, filtramos por él de forma dinámica
    if (eventType) {
      query = query.eq("event_type", eventType);
    }

    const { data: prizes, error } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      prizes,
    });
  } catch (error: any) {
    console.error("❌ Error al obtener premios:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
