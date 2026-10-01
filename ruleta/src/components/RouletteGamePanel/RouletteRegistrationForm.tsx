import { useRouletteForm } from "../../context/form/useFormContext";
import CustomCheckbox from "../CustomCheckbox";
import iconwarning from "../../assets/images/coolicon.svg";
const RouletteRegistrationForm = () => {
  const {
    inputs,
    errors,
    acceptedTerms,
    onTermsChange,
    onInputChange,
    onValidateForm,
  } = useRouletteForm();

  const handleSubmit = () => {
    const isValid = onValidateForm?.();
    if (isValid) {
      console.log("Jugar ruleta");
    }
  };

  return (
    <div className="roulette-form">
      <div className="roulette-form__content">
        <h3 className="roulette-form__title">¡Gira y encuentra tu ahorro!</h3>
        <p className="roulette-form__description">
          Juega nuestra ruleta de descuentos y descubre cuanto puedes ahorrar en
          tus compras
        </p>
        <div className="roulette-form__field">
          <input
            type="email"
            placeholder="Ingresa tu correo"
            name="email"
            value={inputs?.email ?? ""}
            onChange={onInputChange}
            className="roulette-form__input"
          />
          <CustomCheckbox
            checked={acceptedTerms ?? false}
            onChange={onTermsChange}
            label={
              <>
                Acepto los{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  términos y condiciones
                </a>
              </>
            }
          />
          {(errors?.email || errors?.terms) && (
            <div className="roulette-form__error-banner">
              <span className="roulette-form__error-icon">
                <img src={iconwarning} alt="Advertencia" />
              </span>
              {errors?.terms && (
                <span className="roulette-form__error-message">
                  {errors.terms}
                </span>
              )}
              {errors?.email && (
                <span className="roulette-form__error-message">
                  {errors.email}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        className={`roulette-form__button`}
        onClick={handleSubmit}
      >
        Jugar
      </button>
    </div>
  );
};

export default RouletteRegistrationForm;
