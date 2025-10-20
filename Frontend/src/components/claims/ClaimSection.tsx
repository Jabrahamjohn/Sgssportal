import React from 'react'

export const ClaimSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white rounded-2xl shadow p-6 space-y-3">
    <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
    <div>{children}</div>
  </section>
)
