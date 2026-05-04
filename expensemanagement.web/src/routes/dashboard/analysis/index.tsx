import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useExpenses } from "@/hooks/useExpenses";

import { useQuery } from "@tanstack/react-query";
import { getMonthlySummary } from "@/api/expense";
import { generateInsights } from "@/lib/generateInsights";
import { useTranslation } from "react-i18next";
import Heading from "@/components/ui/Heading";

export const Route = createFileRoute("/dashboard/analysis/")({
  component: ReportPage,
});

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];


function ReportPage() {
  const { t } = useTranslation();
  const { expenses } = useExpenses();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());

  

  // ── Monthly budget summary ─────────────────────────────────────────────────
  const { data: monthlySummary } = useQuery({
    queryKey: ["category-budgets", month, year],
    queryFn: () => getMonthlySummary(month, year),
  });

  // ── Filter expenses to selected month ─────────────────────────────────────
  const monthlyExpenses = (expenses ?? []).filter((exp) => {
    const d = new Date(exp.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

 
  // ── Local insights (no API needed) ────────────────────────────────────────
  const { insights, warnings, tips } = useMemo(
    () => generateInsights(monthlySummary, monthlyExpenses, MONTH_NAMES[month - 1], year),
    [monthlySummary, monthlyExpenses, month, year]
  );

  const insightsSections = [
    {
      label:  t("report.aiInsights"),
      items:  insights,
      color:  "text-emerald-700",
      bg:     "bg-emerald-50",
      border: "border-emerald-100",
      dot:    "bg-emerald-400",
    },
    {
      label:  t("report.aiWarnings"),
      items:  warnings,
      color:  "text-amber-700",
      bg:     "bg-amber-50",
      border: "border-amber-100",
      dot:    "bg-amber-400",
    },
    {
      label:  t("report.aiTips"),
      items:  tips,
      color:  "text-blue-700",
      bg:     "bg-blue-50",
      border: "border-blue-100",
      dot:    "bg-blue-400",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
            <Heading HeadTitle={t("analytics.title")} SubTitle={t("analytics.subtitle", { month: MONTH_NAMES[month - 1], year })} />
        </div>
      </div>

    

      {/* Insights panel — auto-generated, no button needed */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {insightsSections.map((section) => (
          <div key={section.label} className={`rounded-2xl border p-5 ${section.bg} ${section.border}`}>
            <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${section.color}`}>
              {section.label}
            </p>
            {section.items.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Nothing to report.</p>
            ) : (
              <ul className="space-y-2.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${section.dot}`} />
                    <span className="text-xs text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
