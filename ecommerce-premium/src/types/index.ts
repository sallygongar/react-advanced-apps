// Product Interface

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

//For the shopping cart, we use the same product interface + a field for quantity.
export interface CartItem extends Product {
  quantity: number;
}
