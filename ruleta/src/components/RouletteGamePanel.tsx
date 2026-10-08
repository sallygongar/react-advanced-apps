import RouletteRegistrationForm from "./RouletteGamePanel/RouletteRegistrationForm";
import RouletteResultCard from "./RouletteResultCard/RouletteResultCard";
import { useRouletteHook } from "../context/roulette/useRouletteHook";

const RouletteGamePanel = () => {
  const { prize, isFinished } = useRouletteHook();
  return (
    <div className="roulette-right__wrapper">
      {isFinished && prize ? (
        <RouletteRegistrationForm />
      ) : (
        <RouletteResultCard />
      )}
    </div>
  );
};

export default RouletteGamePanel;
