import { Card } from "@/components/ui/card";

type AuthLayoutProps = {
    children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100">
  
  {/* LEFT SIDE */}
  <div className="hidden lg:flex flex-col justify-center px-20  from-slate-100 to-slate-200">
    <div>
      <p className="text-[#006B4D]  font-semibold text-lg mb-2">
        Ledger - Your Financial Companion
      </p>

      <h1 className="text-display-lg text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900">
        The Vitality <br />
        of <span className="text-[#006B4D] ">Logic.</span>
      </h1>

      <p className="mt-8 text-on-surface-variant text-lg max-w-sm leading-relaxed font-light">
        Transforming your financial environment into a clean, simple, and powerful experience.
      </p>

      {/* Optional stat card */}
      <div className="mt-10 bg-white p-7 rounded-xl shadow w-fit border-l-4 border-green-800">
        <p className="text-xs text-gray-400">Monthly Efficiency</p>
        <p className="text-headline-sm text-3xl font-bold tracking-tight text-on-surface">+12.4%</p>
      </div>
    </div>
  </div>

  {/* RIGHT SIDE */}
  <div className="flex items-center justify-center px-6 bg-white">
    <div className="w-full p-20 rounded-2xl">
      {children}
    </div>
  </div>
</div>
    );
}
