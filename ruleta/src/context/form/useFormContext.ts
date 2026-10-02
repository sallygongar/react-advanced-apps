import { useContext } from "react";
import FormContext from "./FormContext";

export const useRouletteForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useRuleta must be used within a RuletaProvider");
  }
  return context;
};
