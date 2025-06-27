import React, { useRef, useEffect, useState } from 'react';
import { Palette, Eraser, RotateCcw, Brush } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface DrawingCanvasProps {
  isDrawer: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ isDrawer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const { sendDrawingData } = useSocket();

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set initial background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    // Listen for drawing updates from other players
    const handleDrawingUpdate = (event: CustomEvent) => {
      if (!isDrawer) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
            };
            img.src = event.detail;
          }
        }
      }
    };

    window.addEventListener('drawing-update', handleDrawingUpdate as EventListener);
    return () => {
      window.removeEventListener('drawing-update', handleDrawingUpdate as EventListener);
    };
  }, [isDrawer]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawer) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Send drawing update to other players
    sendDrawingData(canvas.toDataURL());
  };

  const clearCanvas = () => {
    if (!isDrawer) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Send cleared canvas to other players
    sendDrawingData(canvas.toDataURL());
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 border border-white/20">
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          className={`w-full h-80 bg-gray-800 rounded-2xl border-2 border-gray-600 ${
            isDrawer ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {isDrawer && (
        <div className="space-y-4">
          {/* Drawing Tools */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setTool('brush')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                tool === 'brush'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Brush size={20} />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                tool === 'eraser'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Eraser size={20} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Color Palette */}
          <div className="flex items-center justify-center">
            <Palette className="text-gray-400 mr-3" size={20} />
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    currentColor === color
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-gray-500 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="flex items-center justify-center space-x-4">
            <span className="text-white text-sm">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24 accent-blue-500"
            />
            <span className="text-white text-sm w-6">{brushSize}</span>
          </div>
        </div>
      )}

      {!isDrawer && (
        <div className="text-center">
          <p className="text-gray-300">Watching the artist draw...</p>
        </div>
      )}
    </div>
  );
};