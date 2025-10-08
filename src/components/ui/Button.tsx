import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const base =
    variant === 'primary'
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl font-medium transition-colors ${base} ${className}`}
    />
  )
}
