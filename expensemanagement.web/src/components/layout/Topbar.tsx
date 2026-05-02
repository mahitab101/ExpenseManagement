
import { Menu } from "lucide-react";
import HeaderUser from "./HeaderUser";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-20 items-center justify-between shadow-sm border-none px-6">
      <div className="flex items-center gap-2">
        <button className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
<div className="bg-gray-100 rounded-full border-sm border-slate-400 p-4 px-4 flex items-center gap-3 w-96">
<span className="material-symbols-outlined text-slate-400">search</span>
<input className="bg-transparent border-none focus:ring-0 text-sm w-full" placeholder="Search data or reports..." type="text"/>
</div>
</div>
      </div>

     <HeaderUser />
      {/* <button onClick={() => logout()} disabled={isPending}>
        {isPending ? "Logging out..." : "Logout"}
      </button> */}
    </header>
  );
}
