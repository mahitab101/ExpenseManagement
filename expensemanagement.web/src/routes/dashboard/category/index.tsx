
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/category/')({
  component: CategoryPage,
})

function CategoryPage() {
  return <div>
    Hello "/category/"!
   </div>
}
