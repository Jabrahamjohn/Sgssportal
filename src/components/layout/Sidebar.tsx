import React from 'react'
import { Link } from 'react-router-dom'


export default function Sidebar(){
return (
<aside className="w-64 bg-slate-800 text-white min-h-screen p-4">
<nav className="space-y-2">
<Link to="/" className="block p-2 rounded hover:bg-slate-700">Dashboard</Link>
<Link to="/claims/outpatient" className="block p-2 rounded hover:bg-slate-700">New Outpatient Claim</Link>
<Link to="/members" className="block p-2 rounded hover:bg-slate-700">Members</Link>
</nav>
</aside>
)
}