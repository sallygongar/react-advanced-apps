import { useProduct } from "../hooks/useProducts";

export const Home = () => {
  const { products, loading, error } = useProduct();

  if (loading) return <p>Cargando productos del catálogo...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      <h1>Lista de productos</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <img
              src={product.image}
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />
            <h3>{product.title}</h3>
            <p>{product.price.toFixed(2)}</p>
            <button>Añadir al carrito</button>
          </div>
        ))}
      </div>
    </div>
  );
};
