import { useContext } from "react";
import RouletteContext from "./RouletteContext";

export const useRouletteHook = () => {
  const context = useContext(RouletteContext);
  if (!context) {
    throw new Error("useRuleta must be used within a RuletaProvider");
  }
  return context;
};
