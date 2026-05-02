import { ShoppingBag } from "lucide-react";
import type { TopCategoryDto } from "@/Types";

type Props = {
  categories: TopCategoryDto[];
};

export function TopSpendingCategories({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm font-semibold text-gray-800 mb-1">Top spending categories</p>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingBag className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm text-gray-400">No spending data yet</p>
        </div>
      </div>
    );
  }

  const grandTotal = categories.reduce((s, c) => s + c.amount, 0);
  const max = categories[0]?.amount ?? 1;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-800">Top spending categories</h3>
        <span className="text-xs text-gray-400">
          Total: <span className="font-medium text-gray-600">${grandTotal.toLocaleString()}</span>
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-5">This month's breakdown by category</p>

      <div className="flex flex-col gap-4">
        {categories.map((cat) => {
          const barWidth = Math.round((cat.amount / max) * 100);

          return (
            <div key={cat.categoryId}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {/* Icon + color badge */}
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: cat.color + "22" }}
                  >
                    {cat.icon}
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: cat.color + "18",
                      color: cat.color,
                    }}
                  >
                    {cat.categoryName}
                  </span>
                  <span className="text-[10px] text-gray-400">{cat.count} txn</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{cat.percentage}%</span>
                  <span className="text-xs font-semibold text-gray-700 w-20 text-right">
                    ${cat.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${barWidth}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}