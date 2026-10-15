import { Link } from "react-router-dom";
import { useCartStore } from "../hooks/useCartStore";
import styles from "../styles/_navbar.module.scss";

export const Navbar = () => {
  // Leemos el carrito de Zustand para saber cuántos productos hay en total
  const cart = useCartStore((state) => state.cart);

  // Sumamos la cantidad de cada artículo en el carrito
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className={styles.navbar}>
      {/* Un Link que nos lleva de vuelta a la tienda */}
      <Link to="/" className={styles.link}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
          style={{ verticalAlign: "middle", marginRight: "6px" }}
        >
          <path
            fill="#ffffff"
            d="M8 18h34v-3a3 3 0 0 0-3-3H11a3 3 0 0 0-3 3v3z"
          />
          <path
            fill="#ffffff"
            d="M7 19c0 2.21 1.79 4 4.25 4S15.5 21.21 15.5 19c0 2.21 1.79 4 4.25 4s4.25-1.79 4.25-4c0 2.21 1.79 4 4.25 4s4.25-1.79 4.25-4c0 2.21 1.79 4 4.25 4s4.25-1.79 4.25-4V19H7z"
          />
          <path
            fill="#ffffff"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 25v15a1 1 0 0 0 1 1h28a1 1 0 0 0 1-1V25H10zm13 15v-7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v7h-8zm-9-8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3z"
          />
        </svg>
        <span> Mi tiendita</span>
      </Link>

      <div>
        {/* Un Link que nos lleva a la página del carrito */}
        <Link to="/cart" className={styles.link_cart}>
          🛒 Carrito ({totalItems})
        </Link>
      </div>
    </nav>
  );
};
