import { createContext } from "react";
import type { FormErrors, FormInputs } from "../../types/form";
import type { RouletteActions } from "../../types/rouletteActions";

interface RouletteFormContextProps extends RouletteActions {
  inputs: FormInputs;
  errors?: FormErrors;
  acceptedTerms?: boolean;
}

const FormContext = createContext<RouletteFormContextProps | undefined>(
  undefined,
);

export default FormContext;
