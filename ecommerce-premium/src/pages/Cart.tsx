import { Link } from "react-router-dom";
import { useCartStore } from "../hooks/useCartStore";
import styles from "../styles/_cart.module.scss";

export const Cart = () => {
  const { cart, removeFromCart, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

  return (
    <div className={styles.container}>
      <h1>Tu Carrito</h1>
      {cart.length === 0 ? (
        <p className={styles.emptyState}>
          No hay productos en el carrito. <Link to="/">Volver a la tienda</Link>
        </p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.productInfo}>
                <img src={item.image} alt={item.title} />
                <div>
                  <h4>{item.title}</h4>
                  <p>
                    ${item.price} x {item.quantity}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className={styles.deleteButton}
              >
                Eliminar
              </button>
            </div>
          ))}
          <div className={styles.summary}>
            <h3>Total: ${totalPrice.toFixed(2)}</h3>
            <Link to="/checkout">
              <button>Proceder al Pago</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
