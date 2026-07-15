'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReturnAssetSelector from '@/components/employee/ReturnAssetSelector';
import { assignments as assignmentsApi, returns as returnsApi, type Assignment } from '@/lib/api';

type SubmitState = 'idle' | 'loading' | 'success';

export default function ReturnsPage() {
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    assignmentsApi.list({ status: 'active' })
      .then(setMyAssignments)
      .catch(err => setError(err.message))
      .finally(() => setLoadingAssets(false));
  }, []);

  const iconMap: Record<string, string> = {
    laptop: 'laptop_mac', monitor: 'desktop_windows', mobile: 'smartphone',
    peripheral: 'keyboard', infrastructure: 'dns', furniture: 'desk', other: 'devices',
  };

  const selectorAssets = myAssignments.map(a => ({
    id: a.id,
    name: a.asset?.name ?? 'Unknown',
    icon: iconMap[a.asset?.category ?? 'other'] ?? 'devices',
    assignedDate: a.assigned_date
      ? new Date(a.assigned_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '—',
  }));

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selected.length === 0) { setError('Please select at least one asset to return.'); return; }
    const form = e.currentTarget;
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement)?.value;

    setSubmitState('loading');
    setError('');
    try {
      await Promise.all(
        selected.map(assignmentId =>
          returnsApi.create({
            assignment_id: assignmentId,
            return_date: get('return_date') || undefined,
            condition_on_return: get('condition') || undefined,
            return_notes: get('notes') || undefined,
          })
        )
      );
      setSubmitState('success');
      setSelected([]);
      setMyAssignments(prev => prev.filter(a => !selected.includes(a.id)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit return');
      setSubmitState('idle');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-lg">
      <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant">
        <Link href="/employee/dashboard" className="hover:text-primary transition-colors">Asset Management</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">Return Asset</span>
      </nav>

      {loadingAssets ? (
        <p className="text-on-surface-variant">Loading your assets...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <ReturnAssetSelector assets={selectorAssets} selected={selected} onToggle={toggle} />

          {/* Return Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden sticky top-24">
              <div className="p-md bg-surface-container-low border-b border-outline-variant">
                <h2 className="text-title-lg font-bold text-on-surface">Return Details</h2>
                <p className="text-body-sm text-on-surface-variant">Complete this form to finalize your request.</p>
              </div>
              <form onSubmit={handleSubmit} className="p-lg space-y-md">
                <div className="space-y-sm">
                  <label className="block text-label-md text-on-surface-variant">Return Date</label>
                  <input name="return_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-md border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-md" />
                </div>
                <div className="space-y-sm">
                  <label className="block text-label-md text-on-surface-variant">Current Condition</label>
                  <select name="condition" className="w-full p-md border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white transition-all text-body-md appearance-none">
                    <option value="">Select condition</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div className="space-y-sm">
                  <label className="block text-label-md text-on-surface-variant">Return Notes</label>
                  <textarea name="notes" rows={4} placeholder="Mention any damages, missing accessories, or technical issues..." className="w-full p-md border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-md resize-none" />
                </div>
                <div className="flex gap-sm p-sm bg-surface-container-low rounded border border-outline-variant">
                  <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                  <p className="text-[11px] leading-tight text-on-surface-variant">
                    By submitting this request, you confirm that all personal data has been backed up and the device is ready for factory reset.
                  </p>
                </div>
                {error && <p className="text-error text-body-sm">{error}</p>}
                {selected.length > 0 && (
                  <p className="text-body-sm text-primary font-medium">{selected.length} asset(s) selected for return.</p>
                )}
                <button type="submit" disabled={submitState !== 'idle' || selected.length === 0}
                  className={`w-full py-md font-bold text-title-lg rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex items-center justify-center gap-sm ${
                    submitState === 'success' ? 'bg-green-600 text-white' : 'bg-primary text-on-primary hover:opacity-90'
                  } disabled:cursor-wait disabled:opacity-60`}
                >
                  {submitState === 'idle' && <><span>Submit Return Request</span><span className="material-symbols-outlined">send</span></>}
                  {submitState === 'loading' && <><span className="material-symbols-outlined animate-spin">sync</span><span>Processing...</span></>}
                  {submitState === 'success' && <><span className="material-symbols-outlined">check_circle</span><span>Request Submitted</span></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
