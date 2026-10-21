import { useState, type ChangeEvent, type ReactNode } from "react";
import FormContext from "./FormContext";
import type { FormErrors, FormInputs } from "../../types/form";
import { useRouletteHook } from "../roulette/useRouletteHook";

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const { playRoulette, setUserEmail } = useRouletteHook();
  const [inputs, setInputs] = useState<FormInputs>({
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  // Manejo de cambios en los campos de texto
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));

    if (name === "email" && setUserEmail) {
      setUserEmail(value);
    }
  };

  // Manejo del checkbox de términos y condiciones
  const onTermsChange = (accepted: boolean) => {
    setAcceptedTerms(accepted);
  };

  // Validación que consume directamente el estado interno
  const onValidateForm = (): boolean => {
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;
    const newErrors: FormErrors = {};

    if (!inputs.email || !correoRegex.test(inputs.email)) {
      newErrors.email = "No es un correo válido.";
      isValid = false;
    }

    if (!acceptedTerms) {
      newErrors.terms = "Debe aceptar los términos y condiciones.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Limpieza del formulario
  const onClearForm = () => {
    setErrors({});
    setInputs({ email: "" });
    setAcceptedTerms(false);
  };

  return (
    <FormContext.Provider
      value={{
        inputs,
        errors,
        acceptedTerms,
        onInputChange,
        onTermsChange,
        onValidateForm,
        onClearForm,
        playRoulette,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
