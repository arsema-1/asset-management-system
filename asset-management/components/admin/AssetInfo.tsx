const fields = [
  { label: 'Serial Number', value: 'XN-4492-L990-2023' },
  { label: 'Asset Tag', value: 'MBP-089-2024' },
  { label: 'Purchase Date', value: 'Jan 12, 2024' },
  { label: 'Purchase Cost', value: '$3,499.00' },
  { label: 'Warranty Exp.', value: 'Jan 12, 2027' },
  { label: 'Vendor', value: 'Apple Enterprise' },
];

export default function AssetInfo() {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <div className="flex items-center justify-between mb-lg">
        <h3 className="text-title-lg font-bold text-on-surface">Asset Information</h3>
        <button className="text-primary text-label-md font-bold hover:underline">
          View Specification
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-xl gap-x-md">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-label-sm text-on-surface-variant uppercase mb-1">{f.label}</p>
            <p className="text-body-md font-semibold text-on-surface">{f.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
