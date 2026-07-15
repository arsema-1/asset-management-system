import Link from 'next/link';
import ProfileSummaryCard from '@/components/employee/ProfileSummaryCard';
import EditProfileForm from '@/components/employee/EditProfileForm';
import SecuritySection from '@/components/employee/SecuritySection';

export default function ProfilePage() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-md">
        <Link href="/employee/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-on-surface font-medium">Employee Profile</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-lg">
        <ProfileSummaryCard />

        {/* Right column */}
        <div className="w-full lg:w-2/3 flex flex-col gap-lg">
          <EditProfileForm />
          <SecuritySection />
        </div>
      </div>
    </>
  );
}
