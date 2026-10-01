export interface FormInputs {
  email?: string;
  terms?: boolean;
}

export interface FormErrors {
  email?: string; // Mismo nombre que el input
  terms?: string;
}
