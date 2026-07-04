import { useProduct } from "../hooks/useProducts";

// Importamos nuestra tienda global
import { useCartStore } from "../hooks/useCartStore";

import styles from "../styles/_home.module.scss";

export const Home = () => {
  const { products, loading, error } = useProduct();

  // Extraemos únicamente la función 'addToCart' de la tienda global
  const addToCart = useCartStore((state) => state.addToCart);

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>
        Cargando productos del catálogo...
      </p>
    );
  if (error)
    return (
      <p style={{ textAlign: "center", color: "red", marginTop: "40px" }}>
        Error: {error}
      </p>
    );

  return (
    <div className={styles.container}>
      <h1>Lista de productos</h1>
      <div className={styles.grid}>
        {products.map((product) => (
          <div key={product.id} className={styles.card}>
            <img
              src={product.image}
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />
            <h3 className={styles.title}>{product.title}</h3>
            <p className={styles.price}>{product.price.toFixed(2)}</p>
            <button onClick={() => addToCart(product)}>
              Añadir al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
