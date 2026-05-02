import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Heading from '@/components/ui/Heading';
import Loader from '@/components/ui/Loader';
import { useRecurringExpenses } from '@/hooks/useRecurringExpenses';
import { Plus, Pencil, Trash2, RefreshCw, ToggleLeft, ToggleRight, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategories } from '@/hooks/useCategories';
import type { CreateRecurringExpenseDto } from '@/Types';

export const Route = createFileRoute('/dashboard/recurring/')({
  component: RecurringExpensesPage,
});

const INTERVALS = [
  { label: 'Daily',   value: 0 },
  { label: 'Weekly',  value: 1 },
  { label: 'Monthly', value: 2 },
  { label: 'Yearly',  value: 3 },
];

const INTERVAL_COLORS: Record<string, string> = {
  Daily:   'bg-purple-100 text-purple-700',
  Weekly:  'bg-blue-100 text-blue-700',
  Monthly: 'bg-green-100 text-green-700',
  Yearly:  'bg-orange-100 text-orange-700',
};

// ── Form ──────────────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  amount: string;
  interval: number;
  dayOfPeriod: number;
  startDate: string;
  endDate: string;
  categoryId: number | '';
};

const defaultForm = (): FormState => ({
  title: '',
  amount: '',
  interval: 2,
  dayOfPeriod: 1,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  categoryId: '',
});

function RecurringForm({
  initial,
  categories,
  onSubmit,
  onClose,
  isLoading,
}: {
  initial?: FormState;
  categories: any[];
  onSubmit: (dto: CreateRecurringExpenseDto) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial ?? defaultForm());
  const set = (key: keyof FormState, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (!form.title || !form.amount || form.categoryId === '') {
      toast.error('Please fill in all required fields.');
      return;
    }
    onSubmit({
      title: form.title,
      amount: parseFloat(form.amount),
      interval: form.interval,
      dayOfPeriod: form.dayOfPeriod,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      categoryId: Number(form.categoryId),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-800 mb-5">
          {initial ? 'Edit recurring expense' : 'New recurring expense'}
        </h2>

        <div className="flex flex-col gap-3">
          <input
            type="text" placeholder="Title *"
            value={form.title} onChange={(e) => set('title', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number" placeholder="Amount *"
              value={form.amount} onChange={(e) => set('amount', e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />
            <select
              value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            >
              <option value="">Category *</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Repeats</label>
              <select
                value={form.interval} onChange={(e) => set('interval', Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              >
                {INTERVALS.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>
            {form.interval === 2 && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Day of month</label>
                <input
                  type="number" min={1} max={28}
                  value={form.dayOfPeriod} onChange={(e) => set('dayOfPeriod', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start date *</label>
              <input
                type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End date (optional)</label>
              <input
                type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit} disabled={isLoading}
            className="flex-1 py-3 bg-primary-gradient text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} className="px-5 py-3 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function RecurringExpensesPage() {
  const { recurringExpenses, isPending, create, update, toggle, remove } = useRecurringExpenses();
  const { categories } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const handleCreate = (dto: CreateRecurringExpenseDto) => {
    create.mutate(dto, {
      onSuccess: () => { toast.success('Recurring expense created!'); setShowForm(false); },
      onError: () => toast.error('Failed to create.'),
    });
  };

  const handleUpdate = (dto: CreateRecurringExpenseDto) => {
    update.mutate({ id: editing.id, dto: { ...dto, isActive: editing.isActive } }, {
      onSuccess: () => { toast.success('Updated!'); setEditing(null); },
      onError: () => toast.error('Failed to update.'),
    });
  };

  const handleToggle = (id: number) => {
    toggle.mutate(id, {
      onSuccess: () => toast.success('Status updated.'),
      onError: () => toast.error('Failed to toggle.'),
    });
  };

  const handleDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Delete this recurring expense?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-sm bg-gray-200 rounded-md">No</button>
          <button onClick={() => { remove.mutate(id); toast.dismiss(t.id); }} className="px-3 py-1 text-sm bg-red-600 text-white rounded-md">Yes</button>
        </div>
      </div>
    ));
  };

  if (isPending) return <Loader />;

  const totalMonthly = recurringExpenses
    .filter((r) => r.isActive)
    .reduce((sum, r) => {
      if (r.interval === 'Monthly') return sum + r.amount;
      if (r.interval === 'Weekly')  return sum + r.amount * 4.33;
      if (r.interval === 'Daily')   return sum + r.amount * 30;
      if (r.interval === 'Yearly')  return sum + r.amount / 12;
      return sum;
    }, 0);

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <Heading HeadTitle="Recurring Expenses" SubTitle="Auto-expenses created on a schedule" />
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-8 py-4 bg-primary-gradient text-white font-bold rounded-xl editorial-shadow hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Plus size={16} />
          Add recurring
        </button>
      </div>

      {/* Summary card */}
      {recurringExpenses.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Active schedules</p>
            <p className="text-2xl font-bold text-gray-800">{recurringExpenses.filter((r) => r.isActive).length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Est. monthly cost</p>
            <p className="text-2xl font-bold text-gray-800">${totalMonthly.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Paused</p>
            <p className="text-2xl font-bold text-gray-800">{recurringExpenses.filter((r) => !r.isActive).length}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {recurringExpenses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <CalendarClock size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">No recurring expenses yet</p>
          <p className="text-xs text-gray-400 mb-4">Add subscriptions, rent, or any regular payment</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-blue-600 font-medium hover:underline">
            + Add your first recurring expense
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {recurringExpenses.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
              item.isActive ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {item.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${INTERVAL_COLORS[item.interval] ?? 'bg-gray-100 text-gray-600'}`}>
                      {item.interval}
                    </span>
                    <span className="text-xs text-gray-400">{item.categoryName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-gray-800">${item.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">
                    Next: {new Date(item.nextDue).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title={item.isActive ? 'Pause' : 'Resume'}
                  >
                    {item.isActive
                      ? <ToggleRight size={18} className="text-green-500" />
                      : <ToggleLeft size={18} className="text-gray-400" />
                    }
                  </button>
                  <button
                    onClick={() => setEditing(item)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms */}
      {showForm && (
        <RecurringForm
          categories={categories ?? []}
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          isLoading={create.isPending}
        />
      )}
      {editing && (
        <RecurringForm
          initial={{
            title: editing.title,
            amount: String(editing.amount),
            interval: INTERVALS.find((i) => i.label === editing.interval)?.value ?? 2,
            dayOfPeriod: editing.dayOfPeriod,
            startDate: editing.startDate.split('T')[0],
            endDate: editing.endDate?.split('T')[0] ?? '',
            categoryId: editing.categoryId,
          }}
          categories={categories ?? []}
          onSubmit={handleUpdate}
          onClose={() => setEditing(null)}
          isLoading={update.isPending}
        />
      )}
    </div>
  );
}
