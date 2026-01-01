import { ROUTES } from "@/lib/routes";
import { Link, useRouterState } from "@tanstack/react-router";
import {
    LayoutDashboard,
    Tags,
    Wallet,
} from "lucide-react";

const navItems = [
    {
        label: "Dashboard",
        to: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
    },
    {
        label: "Category",
        to: ROUTES.CATEGORIES,
        icon: Tags,
    },
    {
        label: "Expenses",
        to: ROUTES.EXPENSES,
        icon: Wallet,
    },
];

export function Sidebar() {
    const { location } = useRouterState();

    return (
        <aside className="hidden h-screen w-64 flex-col border-r bg-background md:flex">

            <div className="px-6 py-5 text-lg font-semibold text-primary">
                ExpenseManagement
            </div>

            <nav className="px-3">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                        item.to === "/dashboard"
                            ? location.pathname === "/dashboard"
                            : location.pathname.startsWith(item.to);

                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
                                 ${isActive
                                    ? "bg-primary/5 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}

            </nav>
        </aside>
    );
}
