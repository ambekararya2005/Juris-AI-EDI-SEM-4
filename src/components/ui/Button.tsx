import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-white hover:bg-blue-brand focus:ring-2 focus:ring-navy focus:ring-offset-2',
  secondary: 'bg-light-blue text-navy hover:bg-blue-100 focus:ring-2 focus:ring-blue-brand focus:ring-offset-2',
  gold: 'bg-gold text-white hover:bg-amber-500 focus:ring-2 focus:ring-gold focus:ring-offset-2',
  ghost: 'bg-transparent text-muted-text hover:bg-surface-gray focus:ring-2 focus:ring-gray-300',
  danger: 'bg-risk text-white hover:bg-red-700 focus:ring-2 focus:ring-risk focus:ring-offset-2',
  outline: 'bg-transparent border border-navy text-navy hover:bg-light-blue focus:ring-2 focus:ring-navy focus:ring-offset-2',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
