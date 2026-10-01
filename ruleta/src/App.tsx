import RoulettePlayground from "./components/RoulettePlayground";
import { RouletteProvider } from "./context/roulette/RouletteProvider";
import { FormProvider } from "./context/form/FormProvider";
function App() {
  return (
    <>
      <RouletteProvider>
        <FormProvider>
          <RoulettePlayground />
        </FormProvider>
      </RouletteProvider>
    </>
  );
}

export default App;
