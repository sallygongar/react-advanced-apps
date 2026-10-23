import Wheel from "./wheel/Wheel";
import RouletteGamePanel from "./RouletteGamePanel";
import { useRouletteHook } from "../context/roulette/useRouletteHook";

const RoulettePlayground = () => {
  const { loading } = useRouletteHook();

  if (loading) {
    return (
      <div className="roulette-right__wrapper">
        <div className="roulette-right__loading">
          <span className="roulette-right__spinner"></span>
          <p className="roulette-right__description">
            Verificando estatus de participación...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="roulette-playground">
      <Wheel />
      <RouletteGamePanel />
    </div>
  );
};

export default RoulettePlayground;
