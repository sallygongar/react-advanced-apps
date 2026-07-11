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
        🚀 Mi tiendita
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
