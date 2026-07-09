'use client';

import { useState } from 'react';

export default function EditProfileForm() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
        <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">person_edit</span>
          Edit Profile
        </h3>
        <button
          onClick={handleSave}
          className={`px-md py-sm font-medium rounded-lg transition-colors shadow-sm ${
            saved ? 'bg-green-600 text-white' : 'bg-primary text-on-primary hover:opacity-90'
          }`}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-lg">
        {[
          { label: 'Full Name', type: 'text', defaultValue: 'Alex Rivera' },
          { label: 'Phone Number', type: 'tel', defaultValue: '+1 (555) 012-3456' },
        ].map((f) => (
          <div key={f.label} className="space-y-sm">
            <label className="text-label-md text-on-surface-variant">{f.label}</label>
            <input
              type={f.type}
              defaultValue={f.defaultValue}
              className="w-full bg-white border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        ))}

        <div className="space-y-sm">
          <label className="text-label-md text-on-surface-variant">Department</label>
          <select className="w-full bg-white border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
            <option>Marketing</option>
            <option>Engineering</option>
            <option>Human Resources</option>
            <option>Finance</option>
          </select>
        </div>

        <div className="space-y-sm">
          <label className="text-label-md text-on-surface-variant">Work Location</label>
          <input
            type="text"
            defaultValue="New York HQ - Floor 12"
            className="w-full bg-white border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>
    </div>
  );
}
