import { createFileRoute, redirect } from '@tanstack/react-router'
import '../App.css'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: App,
  beforeLoad: () => {
    throw redirect({
      to: "/account/login",
    })
  }
})

function App() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Hello expense</h1>

      <div className="flex items-center gap-2">
        <Button>Login</Button>

        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          Outline Login
        </Button>
      </div>
    </div>
  )
}
