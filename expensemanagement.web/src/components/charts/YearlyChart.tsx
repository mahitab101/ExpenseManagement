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

type YearlyChartProps = {
    yearlyCharts?: DashboardData["yearlyCharts"];
};

export default function YearlyChart({ yearlyCharts }: YearlyChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={yearlyCharts} barGap={10}>

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />

          <YAxis hide />

          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          />

          <Bar
            dataKey="total"
            radius={[10, 10, 0, 0]}
            barSize={26}
          >
            {yearlyCharts?.map((entry, index) => (
              <Cell
                key={index}
                fill="#10B981"
              />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}