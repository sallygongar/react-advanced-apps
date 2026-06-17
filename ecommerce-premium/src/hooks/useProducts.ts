// Hook para manejar 3 estados: Datos, carga y error.

import { useState, useEffect } from "react";
import type { Product } from "../types/index";

export const useProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://fakestoreapi.com/products");

        if (!response.ok) {
          throw new Error("No se pudieron cargar los productos de la tienda");
        }

        const data: Product[] = await response.json();
        //console.log(data, "<<< Lista de productos");
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocurrio un error inesperado.",
        );
      } finally {
        // This always runs, whether it works or fails, to turn off the charging state.
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return { products, loading, error };
};
