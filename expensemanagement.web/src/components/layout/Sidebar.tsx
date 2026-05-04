import { ROUTES } from "@/lib/routes";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  ReceiptText,
  WalletMinimal,
  BarChart3,
  LineChart,
  Settings,
  CalendarClock,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const navItems = [
  { key: "nav.dashboard",  to: ROUTES.DASHBOARD,  icon: LayoutGrid    },
  { key: "nav.categories", to: ROUTES.CATEGORIES, icon: ReceiptText   },
  { key: "nav.expenses",   to: ROUTES.EXPENSES,   icon: WalletMinimal },
  { key: "nav.reports",    to: ROUTES.REPORTS,    icon: BarChart3     },
  { key: "nav.analytics",  to: ROUTES.ANALYSIS,   icon: LineChart     },
  { key: "nav.savingGoal", to: ROUTES.SAVINGS,    icon: LineChart     },
  { key: "nav.recurring",  to: ROUTES.RECURRING,  icon: CalendarClock },
  { key: "nav.settings",   to: "#",               icon: Settings      },
];

export function Sidebar() {
  const { location } = useRouterState();
  const { t } = useTranslation();

  return (
    <aside className="hidden h-screen w-72 flex-col border-r bg-[#F8FAFC] md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-8 py-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00855D]">
          <WalletMinimal className="text-white h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-none text-[#004D3D]">
            {t("mainTitle")}
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-[#00855D] mt-1">
            {t("title")}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.key}
              to={item.to}
              className={`group relative flex items-center gap-4 px-6 py-4 text-base font-bold transition-all duration-200
                ${isActive
                  ? "bg-[#EEF2F6] text-[#006B4D] rounded-full border-r-6 border-[#006B4D]"
                  : "text-[#64748B] hover:bg-gray-100 rounded-lg"
                }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "text-[#006B4D]" : "text-[#64748B]"}`} />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
