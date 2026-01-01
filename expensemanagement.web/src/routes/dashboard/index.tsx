import { createFileRoute, Link } from "@tanstack/react-router"
import {
    DollarSign,
    TrendingUp,
    Receipt,
} from "lucide-react";

import { MonthlyExpensesChart } from "@/components/charts/MonthlyExpensesChart";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import StatCard from "@/components/dashboard/StatCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";

export const Route = createFileRoute("/dashboard/")({
    component: DashboardPage,
});

function DashboardPage() {
    return (
<>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                <StatCard
                    title="Total Expenses"
                    value="$12,450"
                    icon={DollarSign}
                />

                <StatCard
                    title="This Month"
                    value="$2,340"
                    icon={TrendingUp}
                />

                <StatCard
                    title="Transactions"
                    value="124"
                    icon={Receipt}
                />
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <MonthlyExpensesChart />
                <CategoryPieChart />
            </div>
            {/* Activity */}
            <div className="mt-10">
                <h2 className="mb-4 text-lg font-semibold">
                    Recent Activity
                </h2>
                <Link to="/dashboard/expense" className="text-sm text-primary hover:underline">
                    View all
                </Link>

                <div className="space-y-3">
                    <ActivityItem
                        title="Groceries"
                        subtitle="Food · Today"
                        amount={-120}
                    />

                    <ActivityItem
                        title="Electricity Bill"
                        subtitle="Utilities · Yesterday"
                        amount={-75}
                    />

                    <ActivityItem
                        title="Salary"
                        subtitle="Income · 2 days ago"
                        amount={2500}
                    />
                </div>
            </div>
</>
    );
}


