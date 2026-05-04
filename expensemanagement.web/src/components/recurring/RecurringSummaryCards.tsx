import { useTranslation } from "react-i18next";
import type { RecurringExpense } from "@/Types";

type Props = {
  recurringExpenses: RecurringExpense[];
};

export default function RecurringSummaryCards({ recurringExpenses }: Props) {
  const { t } = useTranslation();

  const totalMonthly = recurringExpenses
    .filter((r) => r.isActive)
    .reduce((sum, r) => {
      if (r.interval === "Monthly") return sum + r.amount;
      if (r.interval === "Weekly")  return sum + r.amount * 4.33;
      if (r.interval === "Daily")   return sum + r.amount * 30;
      if (r.interval === "Yearly")  return sum + r.amount / 12;
      return sum;
    }, 0);

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-400 mb-1">{t("recurring.activeSchedules")}</p>
        <p className="text-2xl font-bold text-gray-800">
          {recurringExpenses.filter((r) => r.isActive).length}
        </p>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-400 mb-1">{t("recurring.estMonthlyCost")}</p>
        <p className="text-2xl font-bold text-gray-800">${totalMonthly.toFixed(0)}</p>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-400 mb-1">{t("recurring.paused")}</p>
        <p className="text-2xl font-bold text-gray-800">
          {recurringExpenses.filter((r) => !r.isActive).length}
        </p>
      </div>
    </div>
  );
}
