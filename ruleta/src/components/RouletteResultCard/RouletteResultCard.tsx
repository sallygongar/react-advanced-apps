import { useRouletteHook } from "../../context/roulette/useRouletteHook";
import RouletteWinnerCard from "./RouletteWinnerCard";
import RouletteNoPrizeCard from "./RouletteNoPrizeCard";

const RouletteResultCard = () => {
  const { prize } = useRouletteHook();

  return (
    <div className="roulette-result">
      {prize?.isWin ? (
        <RouletteWinnerCard
          code={prize?.code}
          description={prize?.description}
        />
      ) : (
        <RouletteNoPrizeCard />
      )}
    </div>
  );
};

export default RouletteResultCard;
