import { useEffect, useRef } from "react";
import type { CanvasContext } from "../../types/wheel";
import ping from "../../assets/images/ping.png";
import { isMobile } from "react-device-detect";
import type { PromotionItem } from "../../types/wheel";
import { useRouletteHook } from "../../context/roulette/UseRouletteHook";

const Wheel = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    promotions,
    colors,
    promotion,
    degreeToFall,
    isSpinning,
    isDone,
    sessionPrize,
  } = useRouletteHook();
  //console.log(promotions, "<<<< promotions");
  // Función para dibujar un segmento individual
  const drawSegment = (
    context: CanvasContext,
    index: number,
    totalSegments: number,
    centerX: number,
    centerY: number,
    radio: number,
  ) => {
    if (!context || !promotions[index]) return;

    const arcSize = (2 * Math.PI) / totalSegments;
    const startAngle = index * arcSize;
    const endAngle = startAngle + arcSize;

    // 1. Dibujar Rebanada
    context.beginPath();
    context.arc(centerX, centerY, radio, startAngle, endAngle);
    context.lineTo(centerX, centerY);

    context.lineWidth = 8;
    context.strokeStyle = "#DB061C";
    context.stroke();

    context.fillStyle = index % 2 === 0 ? colors[0] : colors[1];
    context.fill();

    // 2. Dibujar Texto Radial
    context.save();
    context.translate(centerX, centerY);
    // Rota hacia el centro de la rebanada actual
    context.rotate(startAngle + arcSize / 2);

    context.textAlign = "right";
    context.textBaseline = "middle";
    context.fillStyle = index % 2 === 0 ? "#111" : "#fff";

    const textPromotion = promotions[index].description;
    // Ubicar el texto a un 80% del radio desde el centro
    const textDistance = radio * 0.8;

    drawText(context, textPromotion, textDistance, 0);
    context.restore();
  };

  function drawText(
    context: CanvasContext,
    text: string,
    x: number,
    y: number,
  ) {
    if (!context) return;
    const lines = text.split("\n");
    let yOffset = 0;

    context.font = isMobile ? "600 12px Montserrat" : "600 14px Montserrat";

    lines.forEach((line) => {
      const cleanLine = line.replace(/\*/g, "");
      context.fillText(cleanLine, x, y + yOffset);
      yOffset += 16;
    });
  }

  // Listener del fin de la animación
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTransitionEnd = () => {
      //onIsDone?.(true);
    };

    canvas.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      canvas.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, []);

  // Renderizado del Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpiar canvas antes de redibujar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalSegments = promotions.length;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radio = isMobile ? 160 : 170;

    if (totalSegments > 0) {
      for (let i = 0; i < totalSegments; i++) {
        drawSegment(ctx, i, totalSegments, centerX, centerY, radio);
      }
    }
  }, [promotions, colors]);

  // Aplicar rotación por CSS
  useEffect(() => {
    if (degreeToFall && degreeToFall > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.style.transition = "transform 10s ease-out";
      canvas.style.transform = `rotate(${degreeToFall}deg)`;
    }
  }, [degreeToFall]);

  // Limpieza y callback al terminar de girar
  useEffect(() => {
    if (isDone) {
      const data = {
        email: "sally@gmail.com",
        description: promotion?.description,
        code: promotion?.code,
        isWin: promotion?.isWin,
      };
      console.log(data);
      //onChangePrize?.(data);
      //onClearRoulette?.();
    }
  }, [isDone]);

  // Posicionar si hay premio guardado en sesión
  useEffect(() => {
    if (sessionPrize && promotions) {
      const canvas = canvasRef.current;
      const targetPromotion = promotions.find(
        (item: PromotionItem) => item?.code === sessionPrize?.code,
      );

      if (!canvas) return;

      const degreeToFall = targetPromotion?.grade || 0;
      canvas.style.transform = `rotate(${degreeToFall}deg)`;
    }
  }, [sessionPrize, promotions]);

  return (
    <div className="ruleta_left_wrapper">
      <div className="ruleta_circle"></div>
      <div
        className={`ruleta_ping ${isSpinning ? "ruleta_animated_ping" : ""}`}
      >
        <img src={ping} alt="ping" width="100%" />
      </div>
      <canvas ref={canvasRef} width={375} height={375}></canvas>
    </div>
  );
};

export default Wheel;
