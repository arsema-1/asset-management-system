import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <header className="bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant shadow-sm sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-gutter max-w-7xl mx-auto h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/AssetFlow_logo-removebg-preview.png"
              alt="AssetFlow"
              width={50}
              height={10}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-md">
            <Link href="/login" className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant px-md py-sm transition-all duration-200 active:opacity-70 hover:text-primary">
              Sign In
            </Link>
            <Link href="/signup" className="bg-primary-container text-on-primary-container px-lg py-sm rounded-lg font-label-md text-label-md hover:opacity-90 transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative pt-xl pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-gutter grid lg:grid-cols-2 gap-xl items-center">
          <div className="z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-xs px-sm py-xs bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm mb-lg">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>New: Automated Asset Depreciation Engine</span>
            </div>
            <h1 className="font-display text-display lg:text-[56px] leading-[1.1] text-on-surface mb-lg tracking-tight">
              Master Your Infrastructure. <br className="hidden lg:block" /> <span className="text-primary">Manage with Precision.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-xl mx-auto lg:mx-0">
              AssetFlow provides high-density information environments for enterprise lifecycle management. Streamline operations with real-time tracking, predictive maintenance, and precise audit trails.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-md">
              <Link href="/signup" className="w-full sm:w-auto bg-primary text-on-primary px-xl py-md rounded-lg font-title-lg shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-sm">
                Get Started
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <button className="w-full sm:w-auto bg-white border border-outline-variant text-on-surface px-xl py-md rounded-lg font-title-lg hover:bg-surface-container transition-all flex items-center justify-center gap-sm">
                <span className="material-symbols-outlined">play_circle</span>
                Watch Demo
              </button>
            </div>
          </div>
          <div className="relative lg:block hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl"></div>
            <div className="relative bg-white rounded-xl shadow-2xl border border-outline-variant p-sm overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                className="rounded-lg w-full h-auto"
                data-alt="A clean, high-fidelity enterprise SaaS dashboard interface with complex data visualizations, asset tables, and performance charts. The UI uses a professional light-mode aesthetic with primary blue accents and soft shadows, appearing highly organized and efficient for infrastructure management."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxy4NWZjP28u1pFvUnDVEG5G07u-DTisvyyauUtQhUsixsipHdYlmHVap2s36fqH7hbKC55C1EGwe9MKvq9c_w-48E0v8WsA8-ktrZKwEu2orw-oEtAuS3M7sTLmfU4R8Gi-kaaPprYP0d5n_5X72NuUomBaTyLnzYtlbh2oVFPOP3XQL8QUjW2ogVtpeEeZC-po2zL8AraZOHekojmbUoljGkllvkn5QpfcZsRFtCGq2XgnL5Bc9Jyg"
                alt="Dashboard preview"
              />
            </div>
          </div>
        </div>
      </main>

      <section className="py-xl bg-surface-container-low border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-gutter text-center">
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-xl">Trusted by global industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-xl md:gap-32 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="h-8 w-24 bg-on-surface-variant/20 rounded"></div>
            <div className="h-8 w-32 bg-on-surface-variant/20 rounded"></div>
            <div className="h-8 w-28 bg-on-surface-variant/20 rounded"></div>
            <div className="h-8 w-36 bg-on-surface-variant/20 rounded"></div>
            <div className="h-8 w-24 bg-on-surface-variant/20 rounded"></div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-gutter">
          <div className="text-center mb-24">
            <h2 className="font-display text-headline-lg text-[32px] text-on-surface mb-md">Engineered for Operational Excellence</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">AssetFlow eliminates the friction of manual asset logging with enterprise-grade automation and precise tracking logic.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-lg">
            <div className="group p-xl bg-surface-container-low border border-outline-variant rounded-xl hover:shadow-lg transition-all border-b-4 border-b-primary">
              <div className="w-12 h-12 bg-primary text-on-primary rounded-lg flex items-center justify-center mb-xl">
                <span className="material-symbols-outlined">location_searching</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface mb-sm">Real-time Tracking</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Monitor every asset's movement and status across global locations with sub-second latency and geofencing.</p>
            </div>
            <div className="group p-xl bg-surface-container-low border border-outline-variant rounded-xl hover:shadow-lg transition-all border-b-4 border-b-primary">
              <div className="w-12 h-12 bg-primary text-on-primary rounded-lg flex items-center justify-center mb-xl">
                <span className="material-symbols-outlined">precision_manufacturing</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface mb-sm">Automated Maintenance</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Predictive AI triggers work orders before equipment fails, reducing downtime by up to 45% annually.</p>
            </div>
            <div className="group p-xl bg-surface-container-low border border-outline-variant rounded-xl hover:shadow-lg transition-all border-b-4 border-b-primary">
              <div className="w-12 h-12 bg-primary text-on-primary rounded-lg flex items-center justify-center mb-xl">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface mb-sm">Employee Self-Service</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Empower your team to request, return, and troubleshoot assets through a unified mobile-first interface.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-on-background text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="max-w-7xl mx-auto px-gutter relative z-10">
          <div className="grid md:grid-cols-3 gap-xl text-center">
            <div>
              <div className="font-display text-[48px] font-bold text-primary-fixed mb-xs">1M+</div>
              <p className="font-label-md text-label-md text-surface-variant uppercase tracking-widest">Assets Managed</p>
            </div>
            <div>
              <div className="font-display text-[48px] font-bold text-primary-fixed mb-xs">500+</div>
              <p className="font-label-md text-label-md text-surface-variant uppercase tracking-widest">Enterprises</p>
            </div>
            <div>
              <div className="font-display text-[48px] font-bold text-primary-fixed mb-xs">99.9%</div>
              <p className="font-label-md text-label-md text-surface-variant uppercase tracking-widest">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-surface">
        <div className="max-w-5xl mx-auto px-gutter">
          <div className="bg-primary-container rounded-2xl p-xl md:p-32 text-center text-on-primary-container relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
            <h2 className="font-display text-display mb-lg relative z-10">Ready to scale your infrastructure?</h2>
            <p className="font-body-lg text-body-lg mb-xl max-w-xl mx-auto opacity-90 relative z-10">Join thousands of companies using AssetFlow to achieve total visibility and operational precision. Start your 14-day free trial today.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-md relative z-10">
              <button className="bg-white text-primary px-xl py-md rounded-lg font-title-lg hover:bg-surface-container transition-all shadow-md">Start Free Trial</button>
              <button className="bg-transparent border-2 border-white/30 text-white px-xl py-md rounded-lg font-title-lg hover:bg-white/10 transition-all">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-surface-container-low dark:bg-on-background border-t border-outline-variant dark:border-outline">
        <div className="w-full py-xl px-gutter max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-lg">
          <div className="md:col-span-1">
            <Image
              src="/images/AssetFlow_logo-removebg-preview.png"
              alt="AssetFlow"
              width={120}
              height={36}
              className="object-contain mb-md"
            />
            <p className="font-body-sm text-body-sm text-on-secondary-container dark:text-surface-variant mb-lg">
              The next-generation asset management platform for modern enterprise infrastructure.
            </p>
            <div className="flex gap-md">
              <a className="text-outline hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
              <a className="text-outline hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
            </div>
          </div>
          <div className="md:col-span-1">
            <h4 className="font-label-sm text-label-sm text-on-surface uppercase mb-md">Platform</h4>
            <ul className="space-y-sm">
              <li><a className="font-body-sm text-body-sm text-on-secondary-container dark:text-surface-variant hover:text-primary transition-all" href="#">Features</a></li>
              <li><a className="font-body-sm text-body-sm text-on-secondary-container dark:text-surface-variant hover:text-primary transition-all" href="#">Solutions</a></li>
              <li><a className="font-body-sm text-body-sm text-on-secondary-container dark:text-surface-variant hover:text-primary transition-all" href="#">Pricing</a></li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h4 className="font-label-sm text-label-sm text-on-surface uppercase mb-md">Company</h4>
            <ul className="space-y-sm">
              <li><a className="font-body-sm text-body-sm text-on-secondary-container dark:text-surface-variant hover:text-primary transition-all" href="#">About Us</a></li>
              <li><a className="font-body-sm text-body-sm text-on-secondary-container dark:text-surface-variant hover:text-primary transition-all" href="#">Privacy Policy</a></li>
              <li><a className="font-body-sm text-body-sm text-on-secondary-container dark:text-surface-variant hover:text-primary transition-all" href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h4 className="font-label-sm text-label-sm text-on-surface uppercase mb-md">Newsletter</h4>
            <p className="font-body-sm text-body-sm text-on-secondary-container dark:text-surface-variant mb-md">Get the latest updates on infrastructure management.</p>
            <div className="flex gap-xs">
              <input className="bg-surface border border-outline-variant rounded px-sm py-xs text-body-sm w-full focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Email address" type="email" />
              <button className="bg-primary text-on-primary p-xs rounded hover:opacity-90"><span className="material-symbols-outlined text-[20px]">send</span></button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-gutter py-md border-t border-outline-variant/30 flex justify-between items-center">
          <span className="font-body-sm text-body-sm text-on-secondary-container dark:text-surface-variant opacity-70">© 2024 AssetFlow Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-md">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-label-sm text-label-sm text-on-secondary-container dark:text-surface-variant">System Status: Operational</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
