import { createContext } from "react";
import type {
  PrizeData,
  PromotionItem,
  RouletteProps,
} from "../../types/wheel";

interface RouletteContextProps extends RouletteProps {
  isSpinning?: boolean;
  degreeToFall?: number;
  isDone?: boolean;
  promotion?: PromotionItem | null;
  prize?: PrizeData | null;
  sessionPrize?: PrizeData | null;
}

const RouletteContext = createContext<RouletteContextProps | null>(null);

export default RouletteContext;
