import React, { useState } from 'react'
import { supabase } from '../../services/supabaseClient'


export default function Login(){
const [email, setEmail] = useState('')
const [loading, setLoading] = useState(false)


const handleLogin = async (e: React.FormEvent) => {
e.preventDefault()
setLoading(true)
await supabase.auth.signInWithOtp({ email })
setLoading(false)
alert('Check your email for login link')
}


return (
<div className="min-h-screen flex items-center justify-center">
<form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-full max-w-md">
<h2 className="text-xl mb-4">Sign in</h2>
<input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" className="w-full p-2 border rounded mb-4" />
<button className="w-full p-2 bg-blue-600 text-white rounded">{loading? 'Sending...' : 'Send Magic Link'}</button>
</form>
</div>
)
}