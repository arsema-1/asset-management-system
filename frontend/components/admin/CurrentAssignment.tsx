export default function CurrentAssignment() {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <h3 className="text-title-lg font-bold text-on-surface mb-lg">Current Assignment</h3>

      {/* Assignee */}
      <div className="flex items-center gap-md p-md bg-surface-container rounded-lg mb-lg">
        <div className="w-16 h-16 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center text-headline-md font-bold flex-shrink-0">
          SJ
        </div>
        <div>
          <p className="text-body-md font-bold text-on-surface">Sarah Jenkins</p>
          <p className="text-body-sm text-on-surface-variant">Senior Engineer</p>
          <p className="text-label-sm text-primary font-semibold mt-1">Product Team</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-md">
        <div className="flex justify-between items-center py-2 border-b border-outline-variant">
          <span className="text-label-md text-on-surface-variant">Assigned Date</span>
          <span className="text-body-sm font-medium">Jan 15, 2024</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-outline-variant">
          <span className="text-label-md text-on-surface-variant">Last Audit</span>
          <span className="text-body-sm font-medium">Jun 02, 2024</span>
        </div>
        <button className="w-full py-2 border border-primary text-primary text-label-md font-bold rounded-lg hover:bg-primary-container transition-colors mt-md">
          Reassign Asset
        </button>
      </div>
    </section>
  );
}
