import { useRouletteHook } from "../../context/roulette/useRouletteHook";
import RouletteWinnerCard from "./RouletteWinnerCard";
import RouletteNoPrizeCard from "./RouletteNoPrizeCard";

const RouletteResultCard = () => {
  const { prize } = useRouletteHook();

  return (
    <div className="roulette-result">
      {prize?.isWin ? (
        <RouletteNoPrizeCard />
      ) : (
        <RouletteWinnerCard
          code={prize?.code}
          description={prize?.description}
        />
      )}
    </div>
  );
};

export default RouletteResultCard;
