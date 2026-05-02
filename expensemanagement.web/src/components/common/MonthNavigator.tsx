import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

type Props={
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
}
export default function MonthNavigator({ month, year, onPrev, onNext }: Props) {
  const isCurrentMonth =
    month === new Date().getMonth() + 1 && year === new Date().getFullYear();

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
      <button
        onClick={onPrev}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="text-center min-w-32.5">
        <p className="text-sm font-semibold text-gray-800">
          {MONTH_NAMES[month - 1]} {year}
        </p>
        {isCurrentMonth && (
          <p className="text-[10px] text-blue-500 font-medium">Current month</p>
        )}
      </div>

      <button
        onClick={onNext}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}