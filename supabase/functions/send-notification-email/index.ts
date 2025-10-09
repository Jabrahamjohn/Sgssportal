import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  const { record } = await req.json()

  // Fetch user details
  const { data: user } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", record.recipient_id)
    .single()

  if (!user?.email) {
    return new Response("No recipient email found", { status: 400 })
  }

  // Construct email content
  const subject = `[SGSS Medical Fund] ${record.title}`
  const html = `
    <p>Hi ${user.full_name || "Member"},</p>
    <p>${record.message}</p>
    <p><a href="https://sgss.portal${record.link || ""}" target="_blank">View on Portal</a></p>
    <p>— SGSS Medical Fund</p>
  `

  // Send email via Resend REST API
  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SGSS <no-reply@sgss.portal>",
      to: [user.email],
      subject,
      html,
    }),
  })

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text()
    console.error("Failed to send email:", errorText)
    return new Response(`Email failed: ${errorText}`, { status: 500 })
  }

  // Mark notification as sent
  await supabase
    .from("notifications")
    .update({ sent_email: true })
    .eq("id", record.id)

  return new Response("Email sent successfully", { status: 200 })
})
