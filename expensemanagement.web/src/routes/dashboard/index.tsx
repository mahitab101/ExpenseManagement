import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  DollarSign,
  Award,
  Calendar,
  TrendingDown,
  Plus,
} from "lucide-react";

import { MonthlyExpensesChart } from "@/components/charts/MonthlyExpensesChart";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import StatCard from "@/components/dashboard/StateCard";
import YearlyChart from "@/components/charts/YearlyChart";
import { TopSpendingCategories } from "@/components/dashboard/TopSpendingCategories";
import { SmartAlertsPanel } from "@/components/dashboard/SmartAlertsPanel";
import { useState } from "react";
import { MonthComparisonWidget } from "@/components/dashboard/MonthComparisonWidget";
import { SavingsGoalProgress } from "@/components/savingGoal/SavingsGoalProgress";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/dashboard/")(({
  component: DashboardPage,
}));

// ─── Skeleton Components ──────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 bg-white animate-pulse">
      <div className="h-3 w-24 bg-slate-200 rounded mb-4" />
      <div className="h-7 w-32 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-20 bg-slate-100 rounded" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 w-36 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-24 bg-slate-100 rounded mb-6" />
      <div className="flex items-end gap-3 h-48">
        {[60, 85, 45, 90, 70, 55, 80].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-100 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 w-32 bg-slate-200 rounded mb-5" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-slate-100" />
          <div className="flex-1">
            <div className="h-3 w-28 bg-slate-200 rounded mb-1" />
            <div className="h-2 w-16 bg-slate-100 rounded" />
          </div>
          <div className="h-3 w-14 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyActivity({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
        <DollarSign className="w-5 h-5 text-blue-400" />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">
        {t("dashboard.activity.noExpenses")}
      </p>
      <p className="text-xs text-gray-400 mb-4">
        {t("dashboard.activity.startTracking")}
      </p>
      <button
        onClick={onAdd}
        className="text-xs text-blue-600 font-medium hover:underline"
      >
        {t("dashboard.activity.addFirst")}
      </button>
    </div>
  );
}

// ─── Greeting Header ──────────────────────────────────────────────────────────

function GreetingHeader({
  name,
  onAdd,
}: {
  name?: string;
  onAdd: () => void;
}) {
  const { t, i18n } = useTranslation();

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("dashboard.greeting.morning")
      : hour < 17
      ? t("dashboard.greeting.afternoon")
      : t("dashboard.greeting.evening");

  const today = new Date().toLocaleDateString(i18n.language === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          {greeting}{name ? `, ${name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{today}</p>
      </div>
      <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-gradient text-white text-sm font-semibold rounded-xl hover:scale-105 active:scale-95 transition-all duration-150 shadow-sm">
        <Plus className="w-4 h-4" />
        <Link to="/dashboard/expense">{t("dashboard.greeting.addExpense")}</Link>
      </button>
    </div>
  );
}

// ─── Daily Average helper ─────────────────────────────────────────────────────

function getDailyAverage(thisMonthExpense?: number) {
  if (!thisMonthExpense) return undefined;
  const dayOfMonth = new Date().getDate();
  return Math.round(thisMonthExpense / dayOfMonth);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [view, setView] = useState<"monthly" | "yearly">("monthly");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isPending, error } = useDashboard();

  if (!user) navigate({ to: "/login" });

  const dailyAvg = getDailyAverage(data?.summary.thisMonthExpense);
  const today = new Date();

  const todayExpenses = data?.recentExpenses?.today ?? [];
  const yesterdayExpenses = data?.recentExpenses?.yesterday ?? [];

  return (
    <div>
      {/* Greeting + Quick Add */}
      <GreetingHeader
        name={user?.userName ?? "Guest"}
        onAdd={() => setShowAddModal(true)}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              accent
              title={t("dashboard.stats.totalExpense")}
              value={data?.summary.totalExpense}
              icon={<DollarSign size={16} className="text-white" />}
              footer={t("dashboard.stats.overallSpending")}
            />
            <StatCard
              title={t("dashboard.stats.thisMonth")}
              value={data?.summary.thisMonthExpense}
              icon={<Calendar size={16} className="text-purple-500" />}
              trend={data?.summary.percentageChange}
              isExpenseTrend
              footer={t("dashboard.stats.vsLastMonth")}
            />
            <StatCard
              title={t("dashboard.stats.topCategory")}
              value={data?.summary.topCategoryAmount}
              subtitle={data?.summary.topCategoryName}
              icon={<Award size={16} className="text-amber-500" />}
            />
            <StatCard
              title={t("dashboard.stats.dailyAverage")}
              value={dailyAvg}
              subtitle={`${t("dashboard.stats.day")} ${today.getDate()} / ${new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()}`}
              icon={<TrendingDown size={16} className="text-rose-500" />}
              footer={t("dashboard.stats.thisMonthSoFar")}
            />
          </>
        )}
      </div>

      {/* Charts + Month Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isPending ? (
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("dashboard.charts.spendingTrends")}
                </h3>
                <p className="text-sm text-gray-400">
                  {view === "monthly"
                    ? t("dashboard.charts.monthly")
                    : t("dashboard.charts.yearly")}
                </p>
              </div>
              <div className="p-1 rounded-full flex bg-slate-100">
                <button
                  onClick={() => setView("monthly")}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                    view === "monthly"
                      ? "bg-primary-gradient text-white shadow"
                      : "text-gray-500"
                  }`}
                >
                  {t("dashboard.charts.monthly")}
                </button>
                <button
                  onClick={() => setView("yearly")}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                    view === "yearly"
                      ? "bg-primary-gradient text-white shadow"
                      : "text-gray-500"
                  }`}
                >
                  {t("dashboard.charts.yearly")}
                </button>
              </div>
            </div>

            {view === "monthly" ? (
              <MonthlyExpensesChart monthlyCharts={data?.monthlyCharts ?? []} />
            ) : (
              <YearlyChart yearlyCharts={data?.yearlyCharts ?? []} />
            )}
          </div>
        )}

        <MonthComparisonWidget
          thisMonth={data?.summary.thisMonthExpense ?? 0}
          lastMonth={data?.summary.lastMonthTotal ?? 0}
          topCategories={data?.topCategories ?? []}
        />
      </div>

      {/* Bottom row: Top Categories · Smart Alerts · Savings Goals */}
      {!isPending && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <TopSpendingCategories categories={data?.topCategories ?? []} />
          <SmartAlertsPanel alerts={data?.alerts ?? []} />
          <SavingsGoalProgress />
        </div>
      )}

      {/* Recent Activity */}
      {isPending ? (
        <ActivitySkeleton />
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
          <h3 className="text-lg font-semibold mb-4">
            {t("dashboard.activity.title")}
          </h3>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            {t("dashboard.activity.today")}
          </p>
          {todayExpenses.length > 0 ? (
            <div className="space-y-3">
              {todayExpenses.map((exp: any, i: number) => (
                <ActivityItem
                  key={i}
                  title={exp.title}
                  subtitle={exp.categoryName}
                  amount={-exp.amount}
                />
              ))}
            </div>
          ) : (
            <EmptyActivity onAdd={() => setShowAddModal(true)} />
          )}

          {yesterdayExpenses.length > 0 && (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-3">
                {t("dashboard.activity.yesterday")}
              </p>
              <div className="space-y-3">
                {yesterdayExpenses.map((exp: any, i: number) => (
                  <ActivityItem
                    key={i}
                    title={exp.title}
                    subtitle={exp.categoryName}
                    amount={-exp.amount}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
