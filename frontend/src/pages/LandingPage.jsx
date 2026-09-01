import React from 'react';

const metrics = [
  ['balance', 'Bias & Fairness', 'Identifies unequal outcomes and discriminatory patterns.', 'IBM AI Fairness 360 metrics, including Statistical Parity Difference and Disparate Impact.'],
  ['dataset', 'Dataset Quality', 'Examines whether the data is reliable and fit for purpose.', 'Evidently AI checks for completeness, missing values, imbalance, and quality indicators.'],
  ['shield_lock', 'Privacy & Security', 'Reviews how sensitive data and system access are protected.', 'Encryption, anonymization, access controls, and data-minimization evidence.'],
  ['gavel', 'Risk Assessment', 'Maps the system to relevant legal and regulatory obligations.', 'Alignment with GDPR, the EU AI Act, HIPAA, and other applicable requirements.'],
  ['account_tree', 'Accountability', 'Confirms that responsibility and escalation paths are clear.', 'Ownership, auditability, human oversight, and incident-response readiness.'],
  ['visibility', 'Transparency', 'Determines whether stakeholders can understand the system and its limits.', 'Documentation quality, model cards, explainability, and limitation disclosures.'],
  ['architecture', 'Model Architecture', 'Reviews the technical foundation and deployment approach.', 'Architecture records, training methodology, deployment design, and explainability mechanisms.'],
  ['verified_user', 'Robustness', 'Tests whether the system remains dependable under pressure.', 'Failure resilience, adversarial testing, monitoring, and testing practices.'],
  ['speed', 'Performance', 'Validates whether the model meets its stated objectives.', 'Benchmarks, accuracy, precision, recall, and independent validation.'],
  ['eco', 'Environmental Impact', 'Examines the resource footprint across the AI lifecycle.', 'Energy tracking, carbon reporting, resource efficiency, and lifecycle optimization.']
];

const audiences = [
  ['shopping_cart', 'Procurement Officers'],
  ['policy', 'AI Governance Teams'],
  ['fact_check', 'Compliance Professionals'],
  ['crisis_alert', 'Risk Managers'],
  ['account_balance', 'Public Sector Agencies'],
  ['corporate_fare', 'Enterprise Decision Makers']
];

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

export default function LandingPage({ onGetStarted }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3" aria-label="ProcureScore home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-blue-600/20"><Icon>verified</Icon></span>
            <span className="text-lg font-extrabold tracking-tight">ProcureScore</span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex" aria-label="Main navigation">
            <button onClick={() => scrollTo('why')} className="hover:text-primary">Why it matters</button>
            <button onClick={() => scrollTo('how')} className="hover:text-primary">How it works</button>
            <button onClick={() => scrollTo('metrics')} className="hover:text-primary">Metrics</button>
          </nav>
          <button onClick={onGetStarted} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg">Open dashboard</button>
        </div>
      </header>

      <main>
        <section className="relative isolate pt-36 lg:pt-44">
          <div className="landing-orb absolute -right-48 top-16 -z-10 h-[34rem] w-[34rem] rounded-full bg-blue-100 blur-3xl" />
          <div className="landing-grid absolute inset-0 -z-20 opacity-50" />
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 pb-28 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-36">
            <div className="landing-reveal">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
                <Icon className="text-base">shield</Icon> Evidence-led AI governance
              </div>
              <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">AI Procurement,<br /><span className="text-primary">Done Responsibly</span></h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">ProcureScore helps organizations evaluate the trustworthiness of AI systems before procurement through evidence-based governance assessments.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={onGetStarted} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">Get Started <Icon className="transition group-hover:translate-x-1">arrow_forward</Icon></button>
                <button onClick={() => scrollTo('why')} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-700 transition hover:border-primary hover:text-primary">Learn More</button>
              </div>
            </div>
            <div className="landing-reveal relative" style={{ animationDelay: '120ms' }}>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
                <div className="rounded-xl bg-slate-950 p-6 text-white sm:p-8">
                  <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-300">Trust analysis</p><p className="mt-1 text-lg font-bold">Vendor readiness overview</p></div><span className="rounded-lg bg-white/10 p-2"><Icon>analytics</Icon></span></div>
                  <div className="mt-8 grid grid-cols-[auto_1fr] items-center gap-7">
                    <div className="grid h-28 w-28 place-items-center rounded-full p-2 landing-score"><div className="grid h-full w-full place-items-center rounded-full bg-slate-950"><div className="text-center"><strong className="text-3xl">82</strong><p className="text-xs text-slate-400">Trust score</p></div></div></div>
                    <div className="space-y-4">{[['Governance', 88], ['Technical', 79], ['Evidence', 84]].map(([name, score]) => <div key={name}><div className="mb-1 flex justify-between text-xs"><span className="text-slate-300">{name}</span><b>{score}%</b></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-blue-400" style={{ width: `${score}%` }} /></div></div>)}</div>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-3">{[['10', 'Metrics'], ['32', 'Evidence checks'], ['Low', 'Risk level']].map(([value, label]) => <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-3"><b>{value}</b><p className="mt-1 text-[11px] text-slate-400">{label}</p></div>)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="bg-slate-50 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading eyebrow="The control point" title="Why AI procurement matters" text="Performance alone does not guarantee trustworthiness. Responsible procurement must also account for governance, safety, transparency, and real-world risk." />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {[
                ['01', 'Risk enters with the system', 'AI systems can introduce bias, privacy, and compliance risks.'],
                ['02', 'Decisions shape outcomes', 'Procurement is one of the most important control points for AI safety.'],
                ['03', 'Comparability builds confidence', 'Organizations need structured ways to compare AI vendors.']
              ].map(([number, title, text]) => <article key={number} className="group rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"><span className="text-sm font-black text-primary">{number}</span><h3 className="mt-8 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-slate-600">{text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading eyebrow="From evidence to action" title="What ProcureScore does" text="ProcureScore evaluates AI systems across technical and governance dimensions before procurement, turning fragmented vendor evidence into an explainable decision record." />
            <div className="mt-16 grid gap-3 lg:grid-cols-5">
              {[
                ['description', 'Vendor Documentation'], ['fact_check', 'ProcureScore Assessment'], ['manage_search', 'Trust Analysis'], ['lab_profile', 'Risk Report'], ['handshake', 'Procurement Decision']
              ].map(([icon, label], index) => <div key={label} className="relative flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 lg:block lg:text-center"><span className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-primary lg:mx-auto"><Icon>{icon}</Icon></span><h3 className="font-bold lg:mt-4">{label}</h3>{index < 4 && <Icon className="absolute -bottom-7 left-1/2 z-10 -translate-x-1/2 text-slate-300 lg:-right-6 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0">arrow_forward</Icon>}</div>)}
            </div>
          </div>
        </section>

        <section id="metrics" className="bg-slate-950 py-24 text-white lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading dark eyebrow="Multidimensional assurance" title="Trustworthiness metrics" text="Ten complementary measures create a balanced view of vendor readiness—grounded in technical signals, governance evidence, and organizational controls." />
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {metrics.map(([icon, name, description, measurement]) => <article key={name} className="rounded-2xl border border-white/10 bg-white/[.04] p-6 transition hover:-translate-y-1 hover:border-blue-400/50 hover:bg-white/[.07]"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/15 text-blue-300"><Icon>{icon}</Icon></span><h3 className="mt-5 text-lg font-bold">{name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p><div className="mt-5 border-t border-white/10 pt-4"><p className="text-[11px] font-bold uppercase tracking-widest text-blue-300">How it is measured</p><p className="mt-2 text-sm leading-6 text-slate-300">{measurement}</p></div></article>)}
            </div>
          </div>
        </section>

        <section id="how" className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading eyebrow="A rigorous workflow" title="How ProcureScore works" text="A structured assessment combines submitted evidence with specialized evaluators and LLM-assisted verification using Llama 3.1 8B Instruct." />
            <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="grid gap-3 sm:grid-cols-2">{[
                ['list_alt', 'Structured self-assessment'], ['upload_file', 'Document upload'], ['neurology', 'LLM-assisted verification'], ['hub', 'Hybrid evaluation engine'], ['tune', 'Simple average scoring'], ['workspace_premium', 'Trust score generation']
              ].map(([icon, label], index) => <div key={label} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"><span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-primary"><Icon>{icon}</Icon></span><div><span className="text-xs font-black text-slate-400">0{index + 1}</span><p className="font-bold">{label}</p></div></div>)}</div>
              <div className="rounded-2xl bg-slate-50 p-6 sm:p-8">
                <p className="mb-5 text-center text-xs font-black uppercase tracking-widest text-slate-500">Hybrid evaluation engine</p>
                <div className="grid grid-cols-2 gap-3">{['Rule-Based Evaluators', 'IBM AIF360', 'Evidently AI', 'LLM Verification'].map((label) => <div key={label} className="grid min-h-20 place-items-center rounded-xl border border-slate-200 bg-white p-3 text-center text-sm font-bold shadow-sm">{label}</div>)}</div>
                <div className="my-4 flex items-center justify-center gap-3 text-slate-400"><span className="h-px flex-1 bg-slate-300" /><Icon>add</Icon><span className="h-px flex-1 bg-slate-300" /></div>
                <div className="flex items-center justify-center gap-3 rounded-xl bg-primary p-5 text-lg font-extrabold text-white shadow-lg shadow-blue-600/20"><Icon>verified</Icon>ProcureScore</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-50 py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-8">
            <div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">Balanced trust scoring</p><h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Each dimension contributes equally to the final trust score.</h2><p className="mt-5 leading-7 text-slate-600">The overall score is the arithmetic mean of the ten domain scores. There is no penalty for a weaker area; the result reflects the average performance across the assessment.</p></div>
            <div className="space-y-3">{[
              ['error', '0-24', 'Unacceptable risk', 'bg-red-50 text-red-700 border-red-200'],
              ['warning', '25-49', 'High risk', 'bg-amber-50 text-amber-700 border-amber-200'],
              ['schedule', '50-74', 'Limited risk', 'bg-yellow-50 text-yellow-700 border-yellow-200'],
              ['check_circle', '75-100', 'Low risk', 'bg-emerald-50 text-emerald-700 border-emerald-200']
            ].map(([icon, threshold, result, colors]) => <div key={threshold} className={`flex items-center gap-4 rounded-xl border p-5 ${colors}`}><Icon>{icon}</Icon><div className="flex-1"><p className="text-sm font-bold">Score range: {threshold}</p><p className="text-xs opacity-75">Four-band risk classification</p></div><Icon>arrow_forward</Icon><b className="max-w-32 text-right text-sm">{result}</b></div>)}</div>
          </div>
        </section>

        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading eyebrow="Built for accountable decisions" title="Who should use ProcureScore" text="For teams responsible for selecting, governing, and assuring AI systems across the organization." />
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{audiences.map(([icon, name]) => <article key={name} className="flex items-center gap-4 rounded-xl border border-slate-200 p-5 transition hover:border-blue-300 hover:shadow-lg"><span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-primary"><Icon>{icon}</Icon></span><h3 className="font-bold">{name}</h3></article>)}</div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-24 text-center">
          <div className="mx-auto max-w-3xl px-5"><Icon className="text-4xl text-primary">public</Icon><h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">Building the Future of Responsible AI Procurement</h2><p className="mt-6 text-lg leading-8 text-slate-600">ProcureScore transforms AI governance requirements into practical procurement decisions through transparent, explainable, and evidence-based assessment.</p></div>
        </section>

        <section className="px-5 py-20 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-white shadow-2xl shadow-blue-900/20 sm:px-12">
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full border-[45px] border-white/5" /><div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full border-[55px] border-white/5" />
            <div className="relative"><h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to evaluate AI vendors with confidence?</h2><p className="mx-auto mt-4 max-w-xl text-blue-100">Build a defensible, evidence-backed procurement decision with ProcureScore.</p><button onClick={onGetStarted} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50">Get Started <Icon>arrow_forward</Icon></button></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-2 font-extrabold text-slate-900"><Icon className="text-primary">verified</Icon>ProcureScore</div><p>© 2026 ProcureScore. Responsible AI procurement.</p></div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text, dark = false }) {
  return <div className="max-w-3xl"><p className={`text-xs font-black uppercase tracking-[.2em] ${dark ? 'text-blue-300' : 'text-primary'}`}>{eyebrow}</p><h2 className={`mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl ${dark ? 'text-white' : 'text-slate-950'}`}>{title}</h2><p className={`mt-5 text-lg leading-8 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{text}</p></div>;
}
