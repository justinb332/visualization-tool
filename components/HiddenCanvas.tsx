'use client';

import { useRef, useEffect, useState } from 'react';

const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00'];
const brushSizes = [2, 5, 10, 20];

export default function HiddenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [drawing, setDrawing] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      setDrawing(true);
      lastX = e.offsetX;
      lastY = e.offsetY;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
    };

    const handleMouseUp = () => {
      setDrawing(false);
      ctx.closePath();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!drawing) return;
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      lastX = e.offsetX;
      lastY = e.offsetY;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color, brushSize, drawing]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100">
      <div className="relative rounded-lg shadow-lg p-6 bg-white flex flex-col items-center">
        <div className="relative" style={{ width: 800, height: 500 }}>
          {/* Canvas always active */}
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="absolute top-0 left-0 bg-white rounded-lg z-0 border border-gray-300"
          />
          {/* Overlay to hide canvas */}
          {!showDrawing && (
            <div
              className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none rounded-lg"
              style={{ background: '#000' }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center gap-4 mt-6 w-full justify-center">
          {/* Toggle Button */}
          <button
            onClick={() => setShowDrawing(prev => !prev)}
            className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          >
            {showDrawing ? 'Hide Drawing' : 'Show Drawing'}
          </button>

          {/* Color Palette */}
          <div className="flex gap-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-4 ${color === c ? 'border-blue-500' : 'border-gray-300'} transition`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Brush Size Selector */}
          <select
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="p-2 border rounded shadow"
          >
            {brushSizes.map(size => (
              <option key={size} value={size}>
                Brush: {size}px
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}