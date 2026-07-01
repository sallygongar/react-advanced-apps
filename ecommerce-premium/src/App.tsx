import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { OrderSuccess } from "./pages/OrderSuccess";
import { Navbar } from "./components/Navbar";

function App() {
  return (
    // 1. BrowserRouter envuelve toda la app para habilitar la navegación por URL
    <BrowserRouter>
      {/* La Navbar se queda AFUERA de <Routes> porque queremos que sea visible en todas las páginas */}
      <Navbar />

      {/* 2. <Routes> actúa como un switch que decide qué página renderizar según la URL */}
      <main className="container">
        <Routes>
          {/* El path "/" es la página de inicio (Catálogo) */}
          <Route path="/" element={<Home />} />

          {/* Si la URL es /cart, muestra el componente Cart */}
          <Route path="/cart" element={<Cart />} />

          {/* Si la URL es /checkout, muestra la pasarela de pago */}
          <Route path="/checkout" element={<Checkout />} />

          {/* Página final de agradecimiento */}
          <Route path="/order-success" element={<OrderSuccess />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
