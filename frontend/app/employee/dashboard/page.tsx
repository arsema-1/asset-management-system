'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/api';
import EmployeeStatCards from '@/components/employee/EmployeeStatCards';
import MyCurrentAssets from '@/components/employee/MyCurrentAssets';
import ActivityFeed from '@/components/employee/ActivityFeed';

export default function EmployeeDashboard() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Employee';

  // Read user from localStorage on the client only (avoids hydration mismatch)
  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <div className="pt-2">
      {/* Welcome */}
      <header className="mb-xl flex flex-col md:flex-row justify-between items-end md:items-center gap-md">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Welcome back, {userName}</h2>
          <p className="text-body-md text-on-surface-variant">Here is an overview of your equipment and recent requests.</p>
        </div>
        <a href="/employee/requests" className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg font-bold text-label-md hover:-translate-y-0.5 hover:shadow-md transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Request Asset
        </a>
      </header>

      <EmployeeStatCards />

      <div className="grid grid-cols-1 gap-lg">
        <MyCurrentAssets />
        <ActivityFeed />
      </div>
    </div>
  );
}
