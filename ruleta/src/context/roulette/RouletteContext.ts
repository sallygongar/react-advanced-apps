import { createContext } from "react";
import type {
  PrizeData,
  PromotionItem,
  RouletteProps,
} from "../../types/wheel";
import type { RouletteActions } from "../../types/rouletteActions";
import type { FormInputs } from "../../types/form";

interface RouletteContextProps
  extends RouletteProps, RouletteActions, FormInputs {
  isSpinning?: boolean;
  promotion?: PromotionItem | null;
  prize?: PrizeData | null;
  sessionPrize?: PrizeData | null;
  isFinished?: boolean;
  rotationDegree?: number;
  loading?: boolean;
  error?: string | null;
  isPlaying?: boolean;
}

const RouletteContext = createContext<RouletteContextProps | null>(null);

export default RouletteContext;
