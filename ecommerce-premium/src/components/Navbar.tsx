import { Link } from "react-router-dom";
import { useCartStore } from "../hooks/useCartStore";

export const Navbar = () => {
  // Leemos el carrito de Zustand para saber cuántos productos hay en total
  const cart = useCartStore((state) => state.cart);

  // Sumamos la cantidad de cada artículo en el carrito
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "20px",
        background: "#2563eb",
        color: "white",
      }}
    >
      {/* Un Link que nos lleva de vuelta a la tienda */}
      <Link
        to="/"
        style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}
      >
        🚀 Mi E-Commerce
      </Link>

      <div>
        {/* Un Link que nos lleva a la página del carrito */}
        <Link to="/cart" style={{ color: "white", textDecoration: "none" }}>
          🛒 Carrito ({totalItems})
        </Link>
      </div>
    </nav>
  );
};
