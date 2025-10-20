import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </label>
  )
}
