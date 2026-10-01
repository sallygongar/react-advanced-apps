import Wheel from "./wheel/Wheel";
import RouletteGamePanel from "./RouletteGamePanel";

const RoulettePlayground = () => {
  return (
    <div className="roulette-playground">
      <Wheel />
      <RouletteGamePanel />
    </div>
  );
};

export default RoulettePlayground;
