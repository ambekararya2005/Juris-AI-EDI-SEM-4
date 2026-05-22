import React, { useEffect, useRef } from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: string;
  animated?: boolean;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'bg-blue-brand',
  height = 'h-2',
  animated = true,
  label,
}) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animated && barRef.current) {
      barRef.current.style.width = '0%';
      const timeout = setTimeout(() => {
        if (barRef.current) barRef.current.style.width = `${value}%`;
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [value, animated]);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-muted-text mb-1">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
      <div className={`w-full bg-light-blue rounded-full overflow-hidden ${height}`}>
        <div
          ref={barRef}
          className={`${height} ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: animated ? '0%' : `${value}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
