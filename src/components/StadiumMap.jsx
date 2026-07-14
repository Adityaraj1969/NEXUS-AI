import {  useState, useCallback  } from 'react';

/**
 * @fileoverview Interactive SVG stadium map with clickable zones.
 * @module components/StadiumMap
 */

const DEFAULT_ZONES = [
  { id: 'north', name: 'North Stand', path: 'M 100,30 Q 200,5 300,30 L 280,80 Q 200,60 120,80 Z', capacity: 18000 },
  { id: 'south', name: 'South Stand', path: 'M 100,270 Q 200,295 300,270 L 280,220 Q 200,240 120,220 Z', capacity: 18000 },
  { id: 'east', name: 'East Stand', path: 'M 300,30 Q 340,150 300,270 L 280,220 Q 310,150 280,80 Z', capacity: 15000 },
  { id: 'west', name: 'West Stand', path: 'M 100,30 Q 60,150 100,270 L 120,220 Q 90,150 120,80 Z', capacity: 15000 },
  { id: 'field', name: 'Field', path: 'M 120,80 Q 200,60 280,80 Q 310,150 280,220 Q 200,240 120,220 Q 90,150 120,80 Z', capacity: 0 },
];

/**
 * Returns fill color based on density percentage.
 * @param {number} density - 0-100
 * @returns {string} Fill color
 */
function getDensityColor(density) {
  if (density > 85) {return 'rgba(239, 68, 68, 0.6)';}
  if (density > 65) {return 'rgba(245, 158, 11, 0.5)';}
  if (density > 40) {return 'rgba(234, 179, 8, 0.4)';}
  return 'rgba(16, 185, 129, 0.4)';
}

/**
 * Interactive SVG stadium map with colored zones and keyboard navigation.
 *
 * @param {Object} props
 * @param {string} [props.venue] - Venue name for display
 * @param {Array<{id: string, density: number, occupancy: number}>} [props.zones] - Zone data
 * @param {Function} [props.onZoneClick] - Zone click handler
 * @param {string} [props.selectedZone] - Currently selected zone ID
 * @returns {JSX.Element}
 */
export default function StadiumMap({ venue, zones = [], onZoneClick, selectedZone }) {
  const [hoveredZone, setHoveredZone] = useState(null);

  const getZoneData = useCallback(
    (id) => zones.find((z) => z.id === id) || { density: 0, occupancy: 0 },
    [zones]
  );

  const handleKeyDown = useCallback(
    (e, zoneId) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onZoneClick?.(zoneId);
      }
    },
    [onZoneClick]
  );

  return (
    <div className="relative" role="group" aria-label={`Stadium map for ${venue || 'current venue'}`}>
      <svg
        viewBox="0 0 400 300"
        className="w-full rounded-xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="400" height="300" fill="#0B0F1A" rx="12" />

        {/* Grid */}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`g${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300"
            stroke="rgba(108,60,225,0.06)" strokeWidth="0.5" />
        ))}

        {/* Zones */}
        {DEFAULT_ZONES.map((zone) => {
          const data = getZoneData(zone.id);
          const isField = zone.id === 'field';
          const isSelected = selectedZone === zone.id;
          const isHovered = hoveredZone === zone.id;

          return (
            <g key={zone.id}>
              <path
                d={zone.path}
                fill={isField ? 'rgba(16, 185, 129, 0.15)' : getDensityColor(data.density || 0)}
                stroke={isSelected ? '#0AEFB8' : isHovered ? '#6C3CE1' : 'rgba(108,60,225,0.3)'}
                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                className={`transition-all duration-200 ${!isField ? 'cursor-pointer' : ''}`}
                onClick={() => !isField && onZoneClick?.(zone.id)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                onKeyDown={(e) => handleKeyDown(e, zone.id)}
                tabIndex={isField ? -1 : 0}
                role={isField ? 'presentation' : 'button'}
                aria-label={
                  isField
                    ? 'Playing field'
                    : `${zone.name}: ${data.density || 0}% capacity, ${(data.occupancy || 0).toLocaleString()} fans`
                }
              />

              {/* Zone Label */}
              <text
                x={zone.id === 'north' ? 200 : zone.id === 'south' ? 200 :
                   zone.id === 'east' ? 310 : zone.id === 'west' ? 90 : 200}
                y={zone.id === 'north' ? 55 : zone.id === 'south' ? 250 :
                   zone.id === 'east' ? 150 : zone.id === 'west' ? 150 : 145}
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize="10"
                fontFamily="Inter, sans-serif"
                pointerEvents="none"
              >
                {zone.name}
              </text>

              {/* Density % */}
              {!isField && (
                <text
                  x={zone.id === 'north' ? 200 : zone.id === 'south' ? 200 :
                     zone.id === 'east' ? 310 : 90}
                  y={zone.id === 'north' ? 68 : zone.id === 'south' ? 263 :
                     zone.id === 'east' ? 163 : 163}
                  textAnchor="middle"
                  fill="#F9FAFB"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Inter, sans-serif"
                  pointerEvents="none"
                >
                  {data.density || 0}%
                </text>
              )}
            </g>
          );
        })}

        {/* Field markings */}
        <ellipse cx="200" cy="150" rx="60" ry="50" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" />
        <circle cx="200" cy="150" r="5" fill="rgba(16,185,129,0.3)" />
      </svg>

      {/* Hover Tooltip */}
      {hoveredZone && hoveredZone !== 'field' && (
        <div
          className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2
            rounded-lg bg-black/80 px-3 py-2 text-xs text-white shadow-lg"
          role="tooltip"
        >
          <span className="font-semibold">
            {DEFAULT_ZONES.find((z) => z.id === hoveredZone)?.name}
          </span>
          <span className="ml-2 text-nexus-text-secondary">
            {getZoneData(hoveredZone).density || 0}% · {(getZoneData(hoveredZone).occupancy || 0).toLocaleString()} fans
          </span>
        </div>
      )}
    </div>
  );
}
