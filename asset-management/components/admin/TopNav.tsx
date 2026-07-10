import ThemeToggle from '@/components/shared/ThemeToggle';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-40 flex justify-between items-center h-16 px-lg bg-surface-container-lowest border-b border-outline-variant shadow-sm">
      {/* Search — push left on mobile to make room for hamburger */}
      <div className="flex items-center flex-1 max-w-2xl pl-10 lg:pl-0">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border-none rounded-lg pl-xl py-xs text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search assets, users, or tickets..."
            type="text"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-lg">
        <div className="flex items-center gap-md">
          <ThemeToggle />
          <button className="p-xs rounded-full hover:bg-surface-container transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>
          <button className="p-xs rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
          </button>
        </div>

        <div className="h-8 w-px bg-outline-variant" />

        <div className="flex items-center gap-sm cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-label-md font-bold text-on-surface leading-tight">Admin User</p>
            <p className="text-label-sm text-on-surface-variant leading-tight">System Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-label-md border border-outline-variant">
            AU
          </div>
        </div>
      </div>
    </header>
  );
}
