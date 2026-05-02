import { SessionInfo } from '@/components/auth/SessionInfo'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/user/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div><SessionInfo /></div>
}
