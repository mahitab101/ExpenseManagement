import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import MobileSidebar from "./MobileSidebar";

type DashboardLayoutProps = {
  children: ReactNode
}

export function DashboardLayout({children}:DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <MobileSidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex flex-1 flex-col">
        <Topbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
