import { Link } from "@tanstack/react-router";

type TopCardProps = {
    totalAll: number | undefined;
    monthlySpend: number | undefined
}

export default function TopCard({totalAll,monthlySpend}: TopCardProps) {
  return (
   <div className="grid grid-cols-12 gap-6 mb-12">
<div className="col-span-8 bg-slate-50 p-8 rounded-xl flex flex-col justify-between shadow-[0_20px_40px_rgba(11,28,48,0.04)] relative overflow-hidden">
<div className="relative z-10 p-8">
<p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Spend</p>
<h3 className="text-5xl font-black tracking-tighter text-on-surface">$ {totalAll.toLocaleString()}</h3>
</div>
<div className="flex gap-4 mt-8 relative z-10">
<div className="flex-1 bg-blue-100 p-4 rounded-lg">
<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Spend</p>
<p className="text-xl font-bold text-on-surface">$ {monthlySpend.toLocaleString()}</p>
</div>
<div className="flex-1 bg-blue-100 p-4 rounded-lg">
<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variable</p>
<p className="text-xl font-bold text-on-surface">$6,170</p>
</div>
</div>
<div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
<svg className="w-full h-full" viewBox="0 0 200 100">
<path className="text-primary" d="M0,80 Q50,20 100,50 T200,30 L200,100 L0,100 Z" fill="currentColor"></path>
</svg>
</div>
</div>
<div className="col-span-4 bg-primary text-on-primary p-8 rounded-xl shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden">
<div className="relative z-10">
<span className="material-symbols-outlined text-amber-50 text-8xl mb-4" data-icon="auto_awesome">auto_awesome</span>
<h4 className="text-3xl font-bold text-white mb-2">Smart Savings Insight</h4>
<p className="text-sm text-primary-fixed/80 leading-relaxed">AI-powered spending insights to optimize your finances
.</p>
</div>
<button className="mt-3 bg-white text-primary font-bold py-5 px-8 rounded-lg text-sm w-fit active:scale-95 transition-transform">
                       <Link to="/dashboard/report"> View Insight</Link>
                    </button>
<div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-container rounded-full opacity-20 blur-3xl"></div>
</div>
</div>
  )
}
