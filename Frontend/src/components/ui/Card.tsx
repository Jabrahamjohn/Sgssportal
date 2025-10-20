import React from 'react'
export default function Card({children, className = ''}: any){
return <div className={`bg-white rounded shadow p-4 ${className}`}>{children}</div>
}