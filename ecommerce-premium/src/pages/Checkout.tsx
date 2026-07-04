import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCartStore } from "../hooks/useCartStore";

import styles from "../styles/_checkout.module.scss"; // Importamos el Sass Module

// 1. Creamos el esquema con las reglas de negocio
const checkoutSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Introduce un correo electrónico válido"),
  address: z.string().min(5, "La dirección es demasiado corta"),

  // Validamos que sean exactamente 16 números
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, "La tarjeta debe tener exactamente 16 dígitos"),

  // Validamos formato de fecha MM/YY (Mes 01-12 / Año de dos dígitos)
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato requerido: MM/YY"),

  // Validamos el código de seguridad (3 o 4 dígitos de la parte de atrás)
  cvv: z.string().regex(/^\d{3,4}$/, "El CVV debe tener 3 o 4 dígitos"),
});

// 2. Extraemos automáticamente el tipo de TypeScript desde el esquema de Zod
type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const Checkout = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Traemos el total y la función para vaciar el carrito desde Zustand
  const { getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();

  // Inicializamos React Hook Form conectado a nuestro esquema de Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  // Esta función solo se ejecutará si Zod da el visto bueno a los datos
  const onSubmit = (data: CheckoutFormData) => {
    setIsProcessing(true);
    console.log(data, "<< Datos");
    // Simulamos los 3 segundos que tarda un banco real en autorizar un cobro
    setTimeout(() => {
      setIsProcessing(false);
      clearCart(); // Vaciamos el carrito (estado global + localstorage se limpian solos)
      navigate("/order-success"); // Redirigimos a la pantalla de éxito
    }, 3000);
  };

  // Si el carrito está vacío, invitamos al usuario a comprar en lugar de mostrar el formulario
  if (totalPrice === 0) {
    return (
      <div className={styles.emptyCartMessage}>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos para poder proceder al pago.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2>Pasarela de Pago Seguro</h2>
      <p className={styles.total}>Total a pagar: ${totalPrice.toFixed(2)}</p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <input
            {...register("fullName")}
            placeholder="Nombre completo en la tarjeta"
            className={styles.input}
          />
          {errors.fullName && (
            <p className={styles.error}>{errors.fullName.message}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <input
            {...register("email")}
            placeholder="Correo electrónico"
            className={styles.input}
          />
          {errors.email && (
            <p className={styles.error}>{errors.email.message}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <input
            {...register("address")}
            placeholder="Dirección de envío completa"
            className={styles.input}
          />
          {errors.address && (
            <p className={styles.error}>{errors.address.message}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <input
            {...register("cardNumber")}
            placeholder="Número de tarjeta (16 dígitos)"
            maxLength={16}
            className={styles.input}
          />
          {errors.cardNumber && (
            <p className={styles.error}>{errors.cardNumber.message}</p>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <input
              {...register("expiryDate")}
              placeholder="MM/YY"
              maxLength={5}
              className={styles.input}
            />
            {errors.expiryDate && (
              <p className={styles.error}>{errors.expiryDate.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              {...register("cvv")}
              placeholder="CVV"
              maxLength={4}
              type="password"
              className={styles.input}
            />
            {errors.cvv && <p className={styles.error}>{errors.cvv.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className={styles.submitButton}
        >
          {isProcessing
            ? "Conectando con el banco seguro..."
            : `Pagar $${totalPrice.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};
