'use client';

import { useState } from 'react';
import { users as usersApi } from '@/lib/api';

interface FaqItem {
  question: string;
  answer: string;
}

interface Resource {
  icon: string;
  title: string;
  desc: string;
  href: string;
}

interface SupportContentProps {
  role: 'admin' | 'employee';
  faqItems: FaqItem[];
  resources: Resource[];
  contactEmail: string;
  contactPhone: string;
  hours: string;
}

export default function SupportContent({
  role,
  faqItems,
  resources,
  contactEmail,
  contactPhone,
  hours,
}: SupportContentProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'employee') {
      // Mock submit for admin
      setSubmitted(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 4000);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await usersApi.submitSupportTicket(subject, message);
      setSubmitted(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-xs">
            <span>Help Center</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">Support</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">Support Center</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {role === 'admin'
              ? 'Get help with system administration, user management, and platform configuration.'
              : 'Find answers, contact IT, or submit a support request for your assets and account.'}
          </p>
        </div>
      </div>

      {/* Contact cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-primary">mail</span>
          </div>
          <h3 className="text-title-md font-bold text-on-surface mb-xs">Email Support</h3>
          <p className="text-body-sm text-on-surface-variant mb-sm">We typically respond within 24 hours.</p>
          <a href={`mailto:${contactEmail}`} className="text-primary text-label-md font-bold hover:underline">
            {contactEmail}
          </a>
        </div>

        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-primary">call</span>
          </div>
          <h3 className="text-title-md font-bold text-on-surface mb-xs">Phone Support</h3>
          <p className="text-body-sm text-on-surface-variant mb-sm">{hours}</p>
          <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="text-primary text-label-md font-bold hover:underline">
            {contactPhone}
          </a>
        </div>

        <div className="bg-primary-container p-lg rounded-xl text-on-primary-container relative overflow-hidden">
          <div className="relative z-10">
            <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-md">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <h3 className="text-title-md font-bold mb-xs">Live Chat</h3>
            <p className="text-body-sm opacity-90 mb-md">Chat with our support team during business hours.</p>
            <button className="px-md py-sm bg-white text-primary rounded-lg font-bold text-label-md hover:bg-surface-container-lowest transition-colors">
              Start Chat
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* FAQ */}
        <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
          <h3 className="text-title-lg font-bold text-on-surface mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">quiz</span>
            Frequently Asked Questions
          </h3>
          <div className="space-y-sm">
            {faqItems.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.question} className="border border-outline-variant rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between p-md text-left hover:bg-surface-container-low transition-colors"
                  >
                    <span className="text-body-md font-medium text-on-surface pr-md">{item.question}</span>
                    <span className="material-symbols-outlined text-on-surface-variant shrink-0">
                      {open ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {open && (
                    <div className="px-md pb-md text-body-sm text-on-surface-variant border-t border-outline-variant pt-md bg-surface-container-low/50">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Submit ticket */}
        <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
          <h3 className="text-title-lg font-bold text-on-surface mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">confirmation_number</span>
            Submit a Support Ticket
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-lg">
            Describe your issue and our team will get back to you as soon as possible.
          </p>

          {submitted ? (
            <div className="flex items-center gap-md p-lg bg-primary/10 rounded-xl border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[32px]">check_circle</span>
              <div>
                <p className="text-body-md font-bold text-on-surface">Ticket submitted!</p>
                <p className="text-body-sm text-on-surface-variant">
                  We&apos;ve received your request and will respond within 24 hours.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-lg">
              <div className="space-y-sm">
                <label className="text-label-md text-on-surface-variant">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-sm">
                <label className="text-label-md text-on-surface-variant">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide as much detail as possible..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
              {error && <p className="text-error text-body-sm">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-on-primary py-sm rounded-lg font-bold text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-sm disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">{submitting ? 'sync' : 'send'}</span>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          )}
        </section>
      </div>

      {/* Resources */}
      <section>
        <h3 className="text-title-lg font-bold text-on-surface mb-md">Help Resources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {resources.map((r) => (
            <a
              key={r.title}
              href={r.href}
              className="flex items-start gap-md p-lg bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface-container-high hover:border-primary/30 transition-all group"
            >
              <span className="material-symbols-outlined bg-surface-container-high group-hover:bg-primary/10 group-hover:text-primary p-sm rounded-lg transition-colors">
                {r.icon}
              </span>
              <div>
                <p className="text-label-md font-bold text-on-surface">{r.title}</p>
                <p className="text-body-sm text-on-surface-variant mt-xs">{r.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
