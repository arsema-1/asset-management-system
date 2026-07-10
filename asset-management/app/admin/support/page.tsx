import SupportContent from '@/components/shared/SupportContent';

const adminFaq = [
  {
    question: 'How do I add a new employee to the system?',
    answer: 'Navigate to Employees in the sidebar, click "Add Employee", and fill in their details. You can assign a role and department before sending an invitation email.',
  },
  {
    question: 'How do I configure asset categories and types?',
    answer: 'Go to Settings > General to manage organization defaults. Asset categories can be customized when creating or editing assets under the Assets section.',
  },
  {
    question: 'Can I export reports to CSV or PDF?',
    answer: 'Yes. From the Reports page, select your date range and filters, then click Export. Reports are available in CSV, PDF, and Excel formats.',
  },
  {
    question: 'How do I set up automated maintenance reminders?',
    answer: 'In Settings > Notifications, enable Maintenance Alerts. You can configure reminder intervals and assign default technicians in the Maintenance section.',
  },
  {
    question: 'What permissions do different admin roles have?',
    answer: 'Super Admins have full access. Asset Managers can manage inventory and assignments. HR Admins can manage employee records. Configure roles under Settings > Security.',
  },
];

const adminResources = [
  { icon: 'menu_book', title: 'Admin Guide', desc: 'Complete platform administration manual', href: '#' },
  { icon: 'video_library', title: 'Video Tutorials', desc: 'Step-by-step walkthroughs for common tasks', href: '#' },
  { icon: 'api', title: 'API Documentation', desc: 'Integrate AssetFlow with your systems', href: '#' },
  { icon: 'groups', title: 'Community Forum', desc: 'Connect with other AssetFlow administrators', href: '#' },
  { icon: 'update', title: 'Release Notes', desc: 'Latest features and platform updates', href: '#' },
  { icon: 'security', title: 'Security Best Practices', desc: 'Keep your organization data safe', href: '#' },
];

export default function AdminSupportPage() {
  return (
    <SupportContent
      role="admin"
      faqItems={adminFaq}
      resources={adminResources}
      contactEmail="admin-support@assetflow.com"
      contactPhone="+1 (800) 555-0199"
      hours="Mon–Fri, 8 AM – 6 PM EST"
    />
  );
}
