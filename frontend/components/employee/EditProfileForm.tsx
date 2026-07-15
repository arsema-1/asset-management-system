'use client';

import { useState, useEffect } from 'react';
import { getUser, employees as employeesApi, setUser } from '@/lib/api';

export default function EditProfileForm() {
  const [user, setUserState] = useState(getUser());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    work_location: '',
    position: '',
  });

  // Defer localStorage read to avoid hydration mismatch
  useEffect(() => {
    const u = getUser();
    setUserState(u);
    if (u) {
      setFormData({
        first_name: u.first_name ?? '',
        last_name: u.last_name ?? '',
        phone: u.phone ?? '',
        work_location: u.work_location ?? '',
        position: u.position ?? '',
      });
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      const updated = await employeesApi.update(user.id, formData);
      // Update localStorage with form data + response (response only returns basic fields)
      const currentUser = getUser();
      if (currentUser) {
        setUser({ ...currentUser, ...formData, ...updated });
      }
      // Also update local state
      setUserState({ ...user, ...updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-lg text-on-surface-variant">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
        <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">person_edit</span>
          Edit Profile
        </h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-md py-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-60 ${
            saved ? 'bg-green-600 text-white' : 'bg-primary text-on-primary hover:opacity-90'
          }`}
        >
          {saving ? (
            <span className="flex items-center gap-sm">
              <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
              Saving...
            </span>
          ) : saved ? (
            'Saved!'
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="space-y-sm">
          <label className="text-label-md text-on-surface-variant">First Name</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={e => handleChange('first_name', e.target.value)}
            className="w-full bg-white border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-sm">
          <label className="text-label-md text-on-surface-variant">Last Name</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={e => handleChange('last_name', e.target.value)}
            className="w-full bg-white border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-sm">
          <label className="text-label-md text-on-surface-variant">Email</label>
          <input
            type="email"
            value={user.email ?? ''}
            disabled
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface-variant cursor-not-allowed"
          />
          <p className="text-[11px] text-on-surface-variant">Email cannot be changed</p>
        </div>

        <div className="space-y-sm">
          <label className="text-label-md text-on-surface-variant">Employee ID</label>
          <input
            type="text"
            value={user.employee_id ?? '—'}
            disabled
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface-variant cursor-not-allowed"
          />
        </div>

        <div className="space-y-sm">
          <label className="text-label-md text-on-surface-variant">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full bg-white border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-sm">
          <label className="text-label-md text-on-surface-variant">Position / Job Title</label>
          <input
            type="text"
            value={formData.position}
            onChange={e => handleChange('position', e.target.value)}
            placeholder="e.g. Software Engineer"
            className="w-full bg-white border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-sm">
          <label className="text-label-md text-on-surface-variant">Department</label>
          <input
            type="text"
            value={user.department ?? '—'}
            disabled
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface-variant cursor-not-allowed"
          />
        </div>

        <div className="space-y-sm">
          <label className="text-label-md text-on-surface-variant">Work Location</label>
          <input
            type="text"
            value={formData.work_location}
            onChange={e => handleChange('work_location', e.target.value)}
            placeholder="e.g. HQ - Floor 4"
            className="w-full bg-white border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="px-lg pb-lg">
          <p className="text-body-sm text-error bg-error-container px-md py-sm rounded-lg">{error}</p>
        </div>
      )}
    </div>
  );
}
