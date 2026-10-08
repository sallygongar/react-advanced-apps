import { useState } from "react";
import copyIcon from "../../assets/images/Copy.png";
import winGif from "@assets/images/win.gif";

interface RouletteWinnerCardProps {
  code?: string;
  description?: string;
}

const RouletteWinnerCard = ({
  code = "HNKIOLNDSDY",
  description = "*30%*\nen pañales\n*Huggies*",
}: RouletteWinnerCardProps) => {
  const [copied, setCopied] = useState(false);

  const messageLines = description?.replace(/\*/g, "")?.split("\n") ?? [];

  const copyToClipboard = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar el código:", err);
    }
  };

  return (
    <div className="roulette-result__container">
      {/* Header */}
      <div className="roulette-result__header">
        <h3 className="roulette-result__title">¡Felicidades!</h3>
        <img
          className="roulette-result__status-gif"
          src={winGif}
          alt="Felicidades"
        />
      </div>

      {/* Body */}
      <div className="roulette-result__body">
        {messageLines.length > 0 && (
          <div className="roulette-result__prize-badge">
            <span className="roulette-result__prize-highlight">
              {messageLines[0]}
            </span>
            {messageLines[1] && (
              <span className="roulette-result__prize-text">
                {messageLines[1]}
              </span>
            )}
            {messageLines[2] && (
              <span className="roulette-result__prize-subtext">
                {messageLines[2]}
              </span>
            )}
          </div>
        )}

        <p className="roulette-result__instruction">Tu cupón de ahorro es:</p>

        <div className="roulette-result__coupon-box">
          <span className="roulette-result__code">{code}</span>
          <button
            type="button"
            className="roulette-result__copy-btn"
            onClick={copyToClipboard}
            title="Copiar cupón"
          >
            <img src={copyIcon} alt="Copiar" />
          </button>

          {copied && (
            <span className="roulette-result__tooltip">¡Copiado!</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="roulette-result__footer">
        <a className="roulette-result__action-btn" href="/">
          Ver Productos
        </a>
      </div>
    </div>
  );
};

export default RouletteWinnerCard;
