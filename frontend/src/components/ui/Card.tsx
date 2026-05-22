import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-border/50 dark:border-slate-700/50
        ${hover ? 'cursor-pointer hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
