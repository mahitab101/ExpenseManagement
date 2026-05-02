import type { DashboardData } from "@/Types";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
} from "recharts";

type MonthlyExpensesChartProps = {
    monthlyCharts?: DashboardData["monthlyCharts"];
};

export function MonthlyExpensesChart({ monthlyCharts }: MonthlyExpensesChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyCharts} barGap={10}>

          {/* X Axis */}
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />

          {/* Hide Y */}
          <YAxis hide />

          {/* Tooltip */}
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          />

          {/* Bars */}
          <Bar
            dataKey="total"
            radius={[10, 10, 0, 0]}
            barSize={26}
          >
            {monthlyCharts?.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.label.startsWith("4")
                    ? "#059669" // highlight
                    : "#A7F3D0" // soft green
                }
              />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
