import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/category/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/category/"!</div>
}
