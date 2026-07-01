import { Link } from "react-router-dom";

export const OrderSuccess = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>🎉 ¡Pago Procesado con Éxito!</h2>
      <p>Tu orden ha sido simulada correctamente.</p>
      <Link to="/">Volver a la tienda</Link>
    </div>
  );
};
