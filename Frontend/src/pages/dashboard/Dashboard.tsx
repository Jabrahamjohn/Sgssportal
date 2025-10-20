import React from 'react'
import Card from '../../components/ui/Card'


export default function Dashboard(){
return (
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<Card>
<h2 className="text-lg font-semibold">Total Members</h2>
<p className="text-3xl mt-2">—</p>
</Card>
<Card>
<h2 className="text-lg font-semibold">Pending Claims</h2>
<p className="text-3xl mt-2">—</p>
</Card>
<Card>
<h2 className="text-lg font-semibold">Approved Claims</h2>
<p className="text-3xl mt-2">—</p>
</Card>
</div>
)
}