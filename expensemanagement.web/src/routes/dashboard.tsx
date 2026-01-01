import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
})
