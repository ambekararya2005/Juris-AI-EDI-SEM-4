import React from 'react';

interface RiskGaugeProps {
  score: number; // 0-100
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
  // SVG arc gauge
  const strokeWidth = 14;

  const getColor = () => {
    if (score >= 70) return '#C0392B';
    if (score >= 40) return '#E8A020';
    return '#1E7E5A';
  };

  const getLabel = () => {
    if (score >= 70) return 'HIGH RISK';
    if (score >= 40) return 'MEDIUM RISK';
    return 'LOW RISK';
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 200, height: 110 }}>
        <svg width="200" height="110" viewBox="0 0 200 110">
          {/* Background arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="#EBF1FA"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 282.6} 282.6`}
            style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
          />
          {/* Center text */}
          <text x="100" y="85" textAnchor="middle" fontSize="28" fontWeight="700" fill={color} fontFamily="DM Sans">
            {score}
          </text>
          <text x="100" y="102" textAnchor="middle" fontSize="10" fill="#6B7A99" fontFamily="DM Sans">
            out of 100
          </text>
        </svg>
      </div>
      <div
        className="mt-1 px-4 py-1.5 rounded-full text-white text-sm font-bold tracking-wider"
        style={{ backgroundColor: color }}
      >
        {getLabel()}
      </div>
    </div>
  );
};

export default RiskGauge;
