import React from 'react'

export const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      {children}
    </div>
  )
}
