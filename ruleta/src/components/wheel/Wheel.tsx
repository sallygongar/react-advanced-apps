import { useEffect, useRef } from "react";
import type { Canvas, CanvasContext } from "../../types/wheel";
import ping from "../../assets/images/ping-svg-2.svg";
import { isMobile } from "react-device-detect";
import type { PromotionItem } from "../../types/wheel";
import { useRouletteHook } from "../../context/roulette/useRouletteHook";

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

  // Función para dibujar un segmento individual
  const drawWheel = (
    canvas: Canvas,
    context: CanvasContext,
    index: number,
    totalSegments: number,
    centerX: any,
    centerY: any,
    radio: number,
  ) => {
    if (!context) return;
    if (!canvas) return;

    const startAngle = (index * 2 * Math.PI) / totalSegments;
    const endAngle = ((index + 1) * 2 * Math.PI) / totalSegments;

    // 1. Dibujar Rebanada
    context.beginPath();
    //context.arc(centerX, centerY, radio, startAngle, endAngle);

    // Traza un arco (una porción del círculo)
    context.arc(centerX, centerY, radio, startAngle, endAngle);

    // Cierra el arco al centro, creando una "rebanada"
    context.lineTo(centerX, centerY);

    //Configura el estilo del borde y lo dibuja
    context.lineWidth = 8;
    context.strokeStyle = "#37BAED";
    context.stroke();

    //Rellena el segmento con un color
    context.fillStyle = index % 2 === 0 ? colors[0] : colors[1];
    context.fill();

    // // Transforma el contexto para preparar la escritura de texto
    context.save();
    context.translate(centerX, centerY);
    // Rota hacia el centro de la rebanada actual
    context.rotate(
      (3 * 2 * Math.PI) / (totalSegments * totalSegments) +
        (index * 2 * Math.PI) / totalSegments,
    );

    context.translate(-centerX, -centerY);
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillStyle = index % 2 === 0 ? "#111" : "#fff";

    const textPromotion = promotions[index].description;
    // Ubicar el texto a un 80% del radio desde el centro
    const valueX = (centerX / 2) * 3.2;
    const valueY = centerY - 10;

    drawText(context, textPromotion, valueX, valueY);
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
      yOffset += 15;
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
    const ctx = canvas?.getContext("2d");
    if (!canvas) return;
    if (!ctx) return;

    // Limpiar canvas antes de redibujar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalSegments = promotions.length;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radio = isMobile ? 160 : 170;

    if (totalSegments > 0) {
      for (let i = 0; i < totalSegments; i++) {
        drawWheel(canvas, ctx, i, totalSegments, centerX, centerY, radio);
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
    <div className="roulette-left__wrapper">
      <div className="roulette-circle"></div>
      <div
        className={`roulette-ping ${isSpinning ? "roulette-animated__ping" : ""}`}
      >
        <img src={ping} alt="ping" width="100%" />
      </div>
      <canvas ref={canvasRef} width={375} height={375}></canvas>
    </div>
  );
};

export default Wheel;
