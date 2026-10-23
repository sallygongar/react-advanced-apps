import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Método no permitido" });
  }

  try {
    const currentEvent = process.env.ACTIVE_EVENT || "CYBER";
    let query = supabase.from("prize").select("*").eq("is_active", true);

    if (currentEvent) {
      query = query.eq("event_type", currentEvent);
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
    return res.status(500).json({ success: false, error: error.message });
  }
}
