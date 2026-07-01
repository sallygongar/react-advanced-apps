import { Link } from "react-router-dom";

export const Cart = () => {
  return (
    <div>
      <h1>Tu Carrito de Compras</h1>
      <p>Próximamente listaremos los productos aquí...</p>
      <Link to="/checkout">
        <button>Ir a la Pasarela de Pago</button>
      </Link>
    </div>
  );
};
