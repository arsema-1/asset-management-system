import Link from 'next/link';

export default function EmployeeTopNav() {
  return (
    <header className="sticky top-0 z-40 h-16 bg-surface-container-lowest border-b border-outline-variant px-lg flex justify-between items-center shadow-sm">
      {/* Search */}
      <div className="flex items-center gap-xl flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            className="w-full bg-surface-container border-none rounded-full pl-10 pr-4 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            placeholder="Search my assets..."
            type="text"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-lg">
        <Link href="/employee/notifications" className="text-on-surface-variant opacity-80 hover:opacity-100 transition-opacity relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest" />
        </Link>
        <button className="text-on-surface-variant opacity-80 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-label-sm font-bold text-on-primary-container ring-2 ring-outline-variant">
          AU
        </div>
      </div>
    </header>
  );
}
