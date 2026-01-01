import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { monthlyExpenses } from "@/lib/mock-data";

export function MonthlyExpensesChart() {
    return (
        <div className="rounded-2xl bg-background/80 backdrop-blur p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-medium">
                Monthly Expenses
            </h3>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyExpenses}>

                        <XAxis
                            dataKey="month"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip />
                        <Bar
                            dataKey="amount"
                            radius={[8, 8, 0, 0]}
                            fill="green"
                        />

                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
