import SupportContent from '@/components/shared/SupportContent';

const employeeFaq = [
  {
    question: 'How do I request a new asset?',
    answer: 'Go to Requests in the sidebar and click "New Request". Select the asset type, provide a business justification, and submit. You\'ll receive a notification when your request is reviewed.',
  },
  {
    question: 'How do I return an asset when leaving the company?',
    answer: 'Navigate to Returns, select the asset you want to return, fill in the return form with the condition and reason, and submit. IT will schedule a pickup or provide drop-off instructions.',
  },
  {
    question: 'What should I do if my assigned device is damaged?',
    answer: 'Submit a support ticket below or contact IT immediately. Include photos if possible. Do not attempt repairs yourself — unauthorized repairs may void warranty coverage.',
  },
  {
    question: 'How long does it take for a request to be approved?',
    answer: 'Most requests are reviewed within 1–2 business days. Urgent requests can be flagged in the justification field. You\'ll receive email and portal notifications on status changes.',
  },
  {
    question: 'Can I swap my current asset for a different model?',
    answer: 'Yes. Submit a new request explaining why you need a different model. If approved, you\'ll need to return your current asset before the new one is assigned.',
  },
];

const employeeResources = [
  { icon: 'menu_book', title: 'Employee Handbook', desc: 'Company policies for equipment use', href: '#' },
  { icon: 'vpn_key', title: 'VPN Setup Guide', desc: 'Connect securely from home', href: '#' },
  { icon: 'devices', title: 'Asset Care Policy', desc: 'Best practices for device longevity', href: '#' },
  { icon: 'video_library', title: 'Video Tutorials', desc: 'Quick guides for common tasks', href: '#' },
  { icon: 'assignment', title: 'Request Guidelines', desc: 'What you can request and how', href: '#' },
  { icon: 'contact_support', title: 'IT Service Desk', desc: 'Direct line for urgent issues', href: '#' },
];

export default function EmployeeSupportPage() {
  return (
    <SupportContent
      role="employee"
      faqItems={employeeFaq}
      resources={employeeResources}
      contactEmail="support@assetflow.com"
      contactPhone="+1 (800) 555-0100"
      hours="Mon–Fri, 7 AM – 7 PM EST"
    />
  );
}
