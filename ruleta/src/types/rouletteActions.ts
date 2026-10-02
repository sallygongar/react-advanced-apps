import type { ChangeEvent } from "react";
import type { PrizeData } from "./wheel";

export interface RouletteActions {
  playRoulette?: () => void;
  onTermsChange?: (accepted: boolean) => void;
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onSelectPrize?: (prize: PrizeData) => void;
  onValidateForm?: () => boolean;
  onComplete?: (isDone: boolean) => void;
  onClearUser?: () => void;
  onClearRoulette?: () => void;
  onClearForm?: () => void;
}
