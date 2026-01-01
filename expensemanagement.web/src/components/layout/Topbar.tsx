import { Menu } from "lucide-react";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-2">
        <button className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      <div className="text-sm text-muted-foreground">
        Hello, Mahit 👋
      </div>
    </header>
  );
}
