import type { ChangeEvent, ReactNode } from "react";
import "../scss/customCheckBox/customcheckbox.scss";

export interface CustomCheckboxProps {
  label?: ReactNode;
  checked: boolean;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  disabled?: boolean;
}

const CustomCheckbox = ({
  label,
  checked,
  onChange,
  name,
  disabled = false,
}: CustomCheckboxProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked, e);
  };

  return (
    <label
      className={`custom-checkbox ${
        disabled ? "custom-checkbox--disabled" : ""
      }`}
    >
      <input
        type="checkbox"
        className="custom-checkbox__input"
        checked={checked}
        onChange={handleChange}
        name={name}
        disabled={disabled}
      />
      <span className="custom-checkbox__symbol" />
      {label && <span className="custom-checkbox__text">{label}</span>}
    </label>
  );
};

export default CustomCheckbox;
