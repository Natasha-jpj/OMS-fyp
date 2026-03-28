import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

// Server-side instance (used in Server Actions/APIs)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

// Client-side instance (used in Hooks/Components)
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, 
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
)