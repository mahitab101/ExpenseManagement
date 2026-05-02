import { useState } from "react";
import { Plus, X, Target, Pencil, Loader2 } from "lucide-react";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";

const GOAL_COLORS = [
  { bar: "#0058be", bg: "bg-blue-50",   text: "text-blue-700" },
  { bar: "#42be85", bg: "bg-green-50",  text: "text-green-700" },
  { bar: "#8B5CF6", bg: "bg-purple-50", text: "text-purple-700" },
  { bar: "#F97316", bg: "bg-orange-50", text: "text-orange-700" },
  { bar: "#EC4899", bg: "bg-pink-50",   text: "text-pink-700" },
];

function getColor(index: number) {
  return GOAL_COLORS[index % GOAL_COLORS.length];
}

function RingProgress({ pct, color, size = 52 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

type AddGoalFormProps = {
  onAdd: (data: { name: string; target: number; saved: number; color: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
};

function AddGoalForm({ onAdd, onCancel, isLoading }: AddGoalFormProps) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [colorIdx, setColorIdx] = useState("0");

  const handleSubmit = () => {
    if (!name.trim() || !target) return;
    onAdd({ name: name.trim(), target: parseFloat(target), saved: parseFloat(saved) || 0, color: colorIdx });
  };

  return (
    <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
      <p className="text-xs font-semibold text-gray-600 mb-3">New savings goal</p>
      <div className="flex flex-col gap-2">
        <input
          type="text" placeholder="Goal name (e.g. Vacation)"
          value={name} onChange={(e) => setName(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number" placeholder="Target ($)"
            value={target} onChange={(e) => setTarget(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
          />
          <input
            type="number" placeholder="Saved so far ($)"
            value={saved} onChange={(e) => setSaved(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">Color:</span>
          {GOAL_COLORS.map((c, i) => (
            <button
              key={i} onClick={() => setColorIdx(String(i))}
              className={`w-5 h-5 rounded-full border-2 transition-all ${colorIdx === String(i) ? "border-gray-500 scale-110" : "border-transparent"}`}
              style={{ background: c.bar }}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !target || isLoading}
            className="flex-1 py-2 text-xs font-semibold bg-primary-gradient text-white rounded-lg disabled:opacity-40 flex items-center justify-center gap-1"
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            Add goal
          </button>
          <button onClick={onCancel} className="px-4 py-2 text-xs text-gray-500 border border-slate-200 rounded-lg hover:bg-slate-100">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// export function SavingsGoalProgress-old() {
//   const { goals, isPending, addGoal, updateGoal, updateSaved, deleteGoal } = useSavingsGoals();
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [editSaved, setEditSaved] = useState("");

//   const handleAdd = (data: { name: string; target: number; saved: number; color: string }) => {
//     addGoal.mutate(data, { onSuccess: () => setShowForm(false) });
//   };

//   const handleSaveEdit = (id: number, currentGoal: typeof goals[0]) => {
//     const val = parseFloat(editSaved);
//     if (!isNaN(val)) {
//       updateSaved.mutate({ id, saved: val }, {
//         onSuccess: () => { setEditingId(null); setEditSaved(""); }
//       });
//     }
//   };

//   if (isPending) {
//     return (
//       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center h-40">
//         <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//       <div className="flex items-center justify-between mb-1">
//         <div className="flex items-center gap-2">
//           <Target className="w-4 h-4 text-gray-400" />
//           <h3 className="text-sm font-semibold text-gray-800">Savings goals</h3>
//         </div>
//         {!showForm && (
//           <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
//             <Plus className="w-3 h-3" /> Add goal
//           </button>
//         )}
//       </div>
//       <p className="text-xs text-gray-400 mb-5">Track progress toward your targets</p>

//       {goals.length === 0 && !showForm && (
//         <div className="flex flex-col items-center justify-center py-8 text-center">
//           <Target className="w-8 h-8 text-slate-300 mb-2" />
//           <p className="text-sm text-gray-400 mb-3">No goals yet</p>
//           <button onClick={() => setShowForm(true)} className="text-xs text-blue-600 font-medium hover:underline">
//             + Create your first goal
//           </button>
//         </div>
//       )}

//       <div className="flex flex-col gap-4">
//         {goals.map((goal) => {
//           const colorIdx = parseInt(goal.color ?? "0");
//           const color = getColor(colorIdx);
//           const pct = goal.percentageComplete;

//           return (
//             <div key={goal.id} className="flex items-center gap-4">
//               <div className="relative flex items-center justify-center">
//                 <RingProgress pct={pct} color={color.bar} />
//                 <span className="absolute text-[10px] font-bold" style={{ color: color.bar }}>
//                   {pct}%
//                 </span>
//               </div>

//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2 mb-0.5">
//                   <p className="text-sm font-medium text-gray-800 truncate">{goal.name}</p>
//                   {goal.isComplete && (
//                     <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
//                       Complete 🎉
//                     </span>
//                   )}
//                 </div>

//                 {editingId === goal.id ? (
//                   <div className="flex items-center gap-2 mt-1">
//                     <input
//                       type="number" value={editSaved}
//                       onChange={(e) => setEditSaved(e.target.value)}
//                       placeholder={`Current: $${goal.saved.toLocaleString()}`}
//                       className="text-xs border border-slate-200 rounded px-2 py-1 w-32 outline-none focus:border-blue-400"
//                       autoFocus
//                       onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(goal.id, goal)}
//                     />
//                     <button onClick={() => handleSaveEdit(goal.id, goal)} className="text-xs text-blue-600 font-medium hover:underline">
//                       {updateSaved.isPending ? "Saving..." : "Save"}
//                     </button>
//                     <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
//                   </div>
//                 ) : (
//                   <p className="text-xs text-gray-400">
//                     <span className="font-medium text-gray-600">${goal.saved.toLocaleString()}</span>
//                     {" / "}${goal.target.toLocaleString()}
//                     {!goal.isComplete && (
//                       <span className="ml-1 text-gray-300">· ${goal.remaining.toLocaleString()} to go</span>
//                     )}
//                   </p>
//                 )}
//               </div>

//               <div className="flex items-center gap-1 flex-shrink-0">
//                 <button
//                   onClick={() => { setEditingId(goal.id); setEditSaved(String(goal.saved)); }}
//                   className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <Pencil className="w-3 h-3" />
//                 </button>
//                 <button
//                   onClick={() => deleteGoal.mutate(goal.id)}
//                   disabled={deleteGoal.isPending}
//                   className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {showForm && (
//         <AddGoalForm
//           onAdd={handleAdd}
//           onCancel={() => setShowForm(false)}
//           isLoading={addGoal.isPending}
//         />
//       )}
//     </div>
//   );
// }
