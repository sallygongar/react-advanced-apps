import RoulettePlayground from "./components/RoulettePlayground";
import { RouletteProvider } from "./context/roulette/RouletteProvider";

function App() {
  return (
    <>
      <RouletteProvider>
        <RoulettePlayground />
      </RouletteProvider>
    </>
  );
}

export default App;
