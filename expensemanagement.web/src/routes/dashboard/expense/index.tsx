
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/expense/')({
  component: ExpensePage,
})

function ExpensePage() {
  return <div>
    Hello "/dashboard/expense/"!
    </div>
}
