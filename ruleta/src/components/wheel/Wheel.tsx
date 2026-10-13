import { useEffect, useRef } from "react";
import type { Canvas, CanvasContext } from "../../types/wheel";
import ping from "../../assets/images/ping-svg-2.svg";
import { isMobile } from "react-device-detect";
import { useRouletteHook } from "../../context/roulette/useRouletteHook";

const Wheel = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { promotions, colors, isSpinning, rotationDegree } = useRouletteHook();

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

    const segmentAngle = (2 * Math.PI) / totalSegments;
    const startAngle = (index * 2 * Math.PI) / totalSegments;
    const endAngle = ((index + 1) * 2 * Math.PI) / totalSegments;
    const centerAngle = startAngle + segmentAngle / 2;

    // 1. Dibujar Rebanada
    context.beginPath();

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
    context.rotate(centerAngle);

    //context.translate(-centerX, -centerY);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = index % 2 === 0 ? "#111" : "#fff";

    const textPromotion = promotions[index].description;
    // Ubicar el texto a un 80% del radio desde el centro
    //const valueX = (centerX / 2) * 3.2;
    //const valueY = centerY - 10;
    const textDistance = radio * 0.65;

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
    let yOffset = -(lines.length - 1) * 7;

    context.font = isMobile ? "600 12px Montserrat" : "600 14px Montserrat";

    lines.forEach((line) => {
      const cleanLine = line.replace(/\*/g, "");
      context.fillText(cleanLine, x, y + yOffset);
      yOffset += 15;
    });
  }

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rotationDegree) return;
    if (isSpinning) {
      canvas.style.transition = "transform 10s ease-out";
    } else {
      canvas.style.transition = "none";
    }
    canvas.style.transform = `rotate(${rotationDegree}deg)`;
  }, [rotationDegree, isSpinning]);

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
