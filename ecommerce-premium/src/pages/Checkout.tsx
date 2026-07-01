import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCartStore } from "../hooks/useCartStore";

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
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos para poder proceder al pago.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #eee",
        borderRadius: "8px",
      }}
    >
      <h2>Pasarela de Pago Seguro</h2>
      <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        Total a pagar: ${totalPrice.toFixed(2)}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <input
            {...register("fullName")}
            placeholder="Nombre completo en la tarjeta"
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.fullName && (
            <p style={{ color: "red", margin: "4px 0 0", fontSize: "0.85rem" }}>
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register("email")}
            placeholder="Correo electrónico"
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.email && (
            <p style={{ color: "red", margin: "4px 0 0", fontSize: "0.85rem" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register("address")}
            placeholder="Dirección de envío completa"
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.address && (
            <p style={{ color: "red", margin: "4px 0 0", fontSize: "0.85rem" }}>
              {errors.address.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register("cardNumber")}
            placeholder="Número de tarjeta (16 dígitos)"
            maxLength={16}
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.cardNumber && (
            <p style={{ color: "red", margin: "4px 0 0", fontSize: "0.85rem" }}>
              {errors.cardNumber.message}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <input
              {...register("expiryDate")}
              placeholder="MM/YY"
              maxLength={5}
              style={{ width: "100%", padding: "8px" }}
            />
            {errors.expiryDate && (
              <p
                style={{ color: "red", margin: "4px 0 0", fontSize: "0.85rem" }}
              >
                {errors.expiryDate.message}
              </p>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <input
              {...register("cvv")}
              placeholder="CVV"
              maxLength={4}
              type="password"
              style={{ width: "100%", padding: "8px" }}
            />
            {errors.cvv && (
              <p
                style={{ color: "red", margin: "4px 0 0", fontSize: "0.85rem" }}
              >
                {errors.cvv.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          style={{
            padding: "12px",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isProcessing
            ? "Conectando con el banco seguro..."
            : `Pagar $${totalPrice.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};
