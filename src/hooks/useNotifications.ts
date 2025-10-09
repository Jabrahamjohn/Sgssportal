import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return

    // Load existing notifications
    supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotifications(data || []))

    // Realtime subscription
    const channel = supabase
      .channel('notifications:' + userId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
          // Optional toast alert
          toast.info(payload.new.title + ': ' + payload.new.message)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { notifications }
}
