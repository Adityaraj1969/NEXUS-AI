import { useRef, useEffect, useMemo } from 'react';

/**
 * @fileoverview Canvas-based crowd density heatmap visualization.
 * @module components/Heatmap
 */

/**
 * Interpolate between green → yellow → red based on intensity.
 * @param {number} intensity - Value 0–1
 * @returns {string} CSS rgba color
 */
function getHeatColor(intensity) {
  const clamped = Math.max(0, Math.min(1, intensity));
  if (clamped < 0.5) {
    const t = clamped * 2;
    return `rgba(${Math.round(t * 255)}, ${Math.round(200 + t * 55)}, 0, 0.7)`;
  }
  const t = (clamped - 0.5) * 2;
  return `rgba(255, ${Math.round(255 * (1 - t))}, 0, 0.8)`;
}

/**
 * Canvas-rendered crowd density heatmap with color legend.
 *
 * @param {Object} props
 * @param {Array<{x: number, y: number, intensity: number}>} props.data - Heat points
 * @param {number} [props.width=400] - Canvas width
 * @param {number} [props.height=300] - Canvas height
 * @param {number} [props.maxIntensity=100] - Maximum intensity value
 * @returns {JSX.Element}
 */
export default function Heatmap({ data = [], width = 400, height = 300, maxIntensity = 100 }) {
  const canvasRef = useRef(null);

  const avgIntensity = useMemo(() => {
    if (data.length === 0) {return 0;}
    return Math.round(data.reduce((s, d) => s + d.intensity, 0) / data.length);
  }, [data]);

  const densityLevel = avgIntensity > 75 ? 'High' : avgIntensity > 45 ? 'Moderate' : 'Low';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}
    const ctx = canvas.getContext('2d');

    // Scale for device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0B0F1A';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(108, 60, 225, 0.08)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Draw heat points
    data.forEach(({ x, y, intensity }) => {
      const normalized = intensity / maxIntensity;
      const radius = 15 + normalized * 25;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const color = getHeatColor(normalized);

      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    });
  }, [data, width, height, maxIntensity]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="rounded-xl"
        aria-label={`Crowd density heatmap. Overall density: ${densityLevel} (${avgIntensity}%)`}
        role="img"
      />
      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-nexus-text-secondary" aria-hidden="true">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /> Medium
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> High
        </span>
      </div>
    </div>
  );
}
