
import MobileSidebar from '@/components/layout/MobileSidebar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})


function DashboardLayout() {

  const [open, setOpen] = useState(false); return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <MobileSidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex flex-1 flex-col">
        <Topbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
