import { type ReactNode, useEffect, useMemo, useState } from "react";
import RouletteContext from "./RouletteContext";
import type { PromotionItem } from "../../types/wheel";
import promotionsList from "../../data/promotions.json";

export const RouletteProvider = ({ children }: { children: ReactNode }) => {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setColors(["#fff", "#37BAED"]); // 37BAED  ,175C1D
  }, []);

  const promotions: PromotionItem[] = useMemo(() => {
    const total = promotionsList.length;
    if (total === 0) return [];

    const segmentAngle = 360 / total;

    return promotionsList.map((item, index) => {
      const startDegree = index * segmentAngle;
      const endDegree = startDegree + segmentAngle;
      const centerDegree = startDegree + segmentAngle / 2;

      return {
        ...item,
        range: [startDegree, endDegree],
        grade: centerDegree,
      };
    });
  }, [promotionsList]);

  return (
    <RouletteContext.Provider value={{ promotions, colors }}>
      {children}
    </RouletteContext.Provider>
  );
};
