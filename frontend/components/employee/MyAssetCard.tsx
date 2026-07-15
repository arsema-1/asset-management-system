import Link from 'next/link';

interface AssetCardProps {
  id: string;
  name: string;
  tag: string;
  icon: string;
  assignedDate: string;
  condition: string;
  conditionClass: string;
  status: string;
  statusClass: string;
  statusDotClass: string;
  pendingReturn?: boolean;
  onReportIssue?: (id: string, name: string) => void;
}

export default function MyAssetCard({
  id, name, tag, icon, assignedDate, condition,
  conditionClass, status, statusClass, statusDotClass, pendingReturn, onReportIssue,
}: AssetCardProps) {
  return (
    <div className="group bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      {/* Image placeholder */}
      <div className="h-48 relative bg-surface-container flex items-center justify-center">
        <span className="material-symbols-outlined text-[80px] text-outline-variant">{icon}</span>
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 shadow-sm ${statusClass}`}>
          <span className={`w-2 h-2 rounded-full ${statusDotClass}`} />
          {status}
        </div>
      </div>

      {/* Body */}
      <div className="p-md flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-sm">
          <div>
            <h3 className="text-title-lg font-bold text-on-surface">{name}</h3>
            <p className="text-label-md text-on-surface-variant">
              Asset Tag: <span className="font-bold text-on-surface">{tag}</span>
            </p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
        </div>

        <div className="grid grid-cols-2 gap-md py-md border-y border-outline-variant my-md">
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Assigned Date</p>
            <p className="text-body-sm font-semibold">{assignedDate}</p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Condition</p>
            <span className={`text-body-sm font-semibold px-2 py-0.5 rounded-full ${conditionClass}`}>
              {condition}
            </span>
          </div>
        </div>

        <div className="flex gap-md mt-auto">
          {pendingReturn ? (
            <button className="flex-1 text-label-md font-bold py-2 px-4 rounded-lg bg-error-container text-on-error-container hover:opacity-90 transition-opacity active:scale-[0.98] cursor-not-allowed" disabled>
              Pending Return
            </button>
          ) : (
            <>
              <button
                onClick={() => onReportIssue?.(id, name)}
                className="flex-1 text-label-md font-bold py-2 px-4 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors active:scale-[0.98]"
              >
                Report Issue
              </button>
              <Link
                href="/employee/returns"
                className="flex-1 text-center text-label-md font-bold py-2 px-4 rounded-lg border border-outline text-on-surface hover:bg-surface-container-low transition-colors active:scale-[0.98]"
              >
                Request Return
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
