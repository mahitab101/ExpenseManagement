import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { categoryExpenses } from "@/lib/mock-data";


export function CategoryPieChart() {
  return (
    <div className="rounded-2xl bg-background/80 backdrop-blur p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-medium">
        Expenses by Category
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryExpenses}
              dataKey="value"
              nameKey="name"
              fill="green"
        cx="50%"
        cy="50%"
        innerRadius="60%"
        outerRadius="80%"
              paddingAngle={4}
            >
              {categoryExpenses.map((_, index) => (
                <Cell
                  key={index}
                  fill="green"
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
