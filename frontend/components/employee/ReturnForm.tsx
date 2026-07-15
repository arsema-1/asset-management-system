'use client';

import { useState } from 'react';

type SubmitState = 'idle' | 'loading' | 'success';

export default function ReturnForm() {
  const [state, setState] = useState<SubmitState>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    setTimeout(() => {
      setState('success');
      setTimeout(() => setState('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="lg:col-span-5">
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden sticky top-24">
        <div className="p-md bg-surface-container-low border-b border-outline-variant">
          <h2 className="text-title-lg font-bold text-on-surface">Return Details</h2>
          <p className="text-body-sm text-on-surface-variant">Complete this form to finalize your request.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-lg space-y-md">
          {/* Return Date */}
          <div className="space-y-sm">
            <label className="block text-label-md text-on-surface-variant">Return Date</label>
            <input
              type="date"
              className="w-full p-md border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-md"
            />
          </div>

          {/* Condition */}
          <div className="space-y-sm">
            <label className="block text-label-md text-on-surface-variant">Current Condition</label>
            <select className="w-full p-md border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white transition-all text-body-md appearance-none">
              <option value="" disabled selected>Select condition</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-sm">
            <label className="block text-label-md text-on-surface-variant">Return Notes</label>
            <textarea
              rows={4}
              placeholder="Mention any damages, missing accessories, or technical issues..."
              className="w-full p-md border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-md resize-none"
            />
          </div>

          {/* Compliance Notice */}
          <div className="flex gap-sm p-sm bg-surface-container-low rounded border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <p className="text-[11px] leading-tight text-on-surface-variant">
              By submitting this request, you confirm that all personal data has been backed up and the device is ready for factory reset.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={state !== 'idle'}
            className={`w-full py-md font-bold text-title-lg rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex items-center justify-center gap-sm ${
              state === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-primary text-on-primary hover:opacity-90'
            } disabled:cursor-wait`}
          >
            {state === 'idle' && (<><span>Submit Return Request</span><span className="material-symbols-outlined">send</span></>)}
            {state === 'loading' && (<><span className="material-symbols-outlined animate-spin">sync</span><span>Processing...</span></>)}
            {state === 'success' && (<><span className="material-symbols-outlined">check_circle</span><span>Request Submitted</span></>)}
          </button>
        </form>
      </div>
    </div>
  );
}
