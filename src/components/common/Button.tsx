import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: LucideIcon;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  icon: Icon,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-medium transition duration-200 flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105',
    secondary: 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:scale-105',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${disabled ? disabledStyles : ''} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};