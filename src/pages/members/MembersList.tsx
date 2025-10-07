import React from 'react'
import Card from '../../components/ui/Card'


export default function MembersList(){
return (
<div>
<h2 className="text-2xl mb-4">Members</h2>
<Card>
<p>Members table placeholder. Integrate with Supabase `members` table and implement filters: membership type, expiry, NHIF, no-claim discount status.</p>
</Card>
</div>
)
}