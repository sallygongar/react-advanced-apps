# 🚀 TS/React E-Commerce con Pasarela de Pago Simulada

¡Bienvenido! Este proyecto es una plataforma de comercio electrónico moderna, rápida y completamente tipada, construida con **React**, **TypeScript** y **Vite**.

> _Demo en Vivo:_ [Visita la aplicación desplegada aquí](https://sallygongar-ecommerce.vercel.app/)

La aplicación consume una API real de productos, gestiona un carrito de compras persistente y cuenta con un flujo de checkout con validación bancaria estricta.

Desarrollado aplicando buenas prácticas de arquitectura de software, separación de responsabilidades mediante Custom Hooks y modularización de estilos.

---

## 🛠️ Tecnologías y Herramientas

El proyecto está construido sobre el ecosistema moderno de React:

- **Core:** [React 18+](https://react.dev/) + [Vite](https://vitejs.dev/) (para un entorno de desarrollo ultra rápido).
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Tipado estricto y contratos de datos robustos).
- **Estado Global:** [Zustand](https://zustand-demo.pmnd.rs/) + Middleware de persistencia para el carrito de compras.
- **Enrutamiento:** [React Router Dom](https://reactrouter.com/) (Navegación fluida de SPA).
- **Formularios y Validación:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (Validación síncrona en cliente).
- **Estilos:** [Sass Modules](https://sass-lang.com/) (Estilos encapsulados por componente para evitar colisiones).

---

## 💡 Características Clave de la Lógica

Para destacar este repositorio, me enfoqué en resolver problemas del mundo real en el desarrollo frontend:

1.  **Arquitectura Basada en Hooks:** La lógica de consumo asíncrono, control de estados de carga (`loading`) y manejo de errores (`error`) está totalmente aislada de la interfaz visual mediante el Custom Hook `useProducts`.
2.  **Estado Global Optimizado:** El carrito de compras no produce _re-renders_ masivos en la aplicación gracias al sistema de selectores de Zustand.
3.  **Persistencia Automática:** El estado del carrito sobrevive a recargas de página (F5) o cierres de pestaña mediante la sincronización automática con el `LocalStorage`.
4.  **Simulación de Pasarela Bancaria:** El formulario de _Checkout_ valida estructuras complejas de tarjetas (16 dígitos, formato MM/YY, CVV) y simula la latencia de una petición de red con estados asíncronos antes de confirmar la compra.

---

## 📁 Estructura del Proyecto

La arquitectura de carpetas sigue un orden modular y escalable:

```text
src/
├── components/      # Componentes visuales reutilizables (Navbar, etc.)
├── hooks/           # Lógica asíncrona aislada (useProducts)
├── pages/           # Vistas principales (Home, Cart, Checkout, Success)
├── store/           # Estado global con Zustand (useCartStore)
├── styles/          # Variables globales de Sass y estilos base
└── types/           # Interfaces y tipos estrictos de TypeScript
```

## 🚀 Instalación y Uso Local

Sigue estos pasos para clonar y ejecutar el e-commerce en tu máquina local:

Clonar el repositorio:

git clone [https://github.com/sallygongar/react-advanced-apps/tree/main/ecommerce-premium](https://github.com/sagongar/ecommerce-premium.git)
cd TU-REPOSITORIO

## 2. Instalar dependencias:

npm install

## 3. Iniciar el servidor de desarrollo:

npm run dev

## 4. Compilar para producción (Build):

npm run build

📄 Licencia
Este proyecto es de código abierto y está disponible bajo la Licencia MIT.
