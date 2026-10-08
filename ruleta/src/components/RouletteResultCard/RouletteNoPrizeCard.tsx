import gifnowin from "@assets/images/nowin.gif";

const RouletteNoPrizeCard = () => {
  return (
    <div className="roulette-result__container roulette-result__container--no-win">
      {/* Header */}
      <div className="roulette-result__header">
        <h3 className="roulette-result__title">¡Esta vez no fue posible!</h3>
        <img
          className="roulette-result__status-gif"
          src={gifnowin}
          alt="Sigue Participando"
        />
      </div>

      {/* Body */}
      <div className="roulette-result__body roulette-result__body--no-win">
        <p className="roulette-result__message">
          Pero todavía te esperan muchas ofertas
        </p>
      </div>

      {/* Footer */}
      <div className="roulette-result__footer roulette-result__footer--no-win">
        <a className="roulette-result__action-btn" href="/">
          Ver Productos
        </a>
      </div>
    </div>
  );
};

export default RouletteNoPrizeCard;
