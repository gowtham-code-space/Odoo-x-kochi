import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ROUTES } from '../../constants/routes.js';
import { Button } from '../../components/common/Button.jsx';

const features = [
  ['lucide:package', 'Product catalogue', 'Keep products, variants, prices, and availability in one controlled catalogue.'],
  ['lucide:repeat-2', 'Subscription lifecycle', 'Track quotations, confirmation, renewals, pauses, and closures from one record.'],
  ['lucide:receipt-indian-rupee', 'GST-ready billing', 'Prepare invoice totals with clear tax, discount, payment, and overdue states.'],
  ['lucide:bar-chart-3', 'Finance visibility', 'Give finance teams a focused view of recurring revenue, collections, and outstanding balances.'],
];
const faqs = [
  ['Who is SubsManager for?', 'Teams that sell software or services on recurring plans and need a clear operational workflow for products, subscriptions, billing, and collections.'],
  ['Can customers access their own billing details?', 'The customer portal is designed to show a customer only their own subscriptions, invoices, payments, and renewal information.'],
  ['How are roles handled?', 'Admin, Staff, and Customer views are scoped to the actions each role needs. Server-side authorization remains the source of truth.'],
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5 font-headings text-lg font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">S</span>SubsManager</Link>
          <div className="hidden items-center gap-5 text-sm text-muted-foreground md:flex"><a href="#workflow" className="hover:text-primary">Workflow</a><a href="#features" className="hover:text-primary">Features</a><a href="#faq" className="hover:text-primary">FAQ</a></div>
          <div className="flex items-center gap-2"><Link to={ROUTES.LOGIN}><Button variant="ghost" size="sm">Sign in</Button></Link><Link to={ROUTES.REGISTER}><Button size="sm">Start setup</Button></Link></div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Subscription operations, in one workspace</p>
          <h1 className="mt-5 max-w-2xl font-headings text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Run recurring revenue with <span className="text-primary">clearer control.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">A practical subscription-management workspace for product teams, operations, and finance—built around the work Brightloop needs to do every billing month.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link to={ROUTES.REGISTER}><Button size="lg">Create an account <Icon icon="lucide:arrow-right" className="h-4 w-4" /></Button></Link><a href="#workflow"><Button size="lg" variant="secondary">See the workflow</Button></a></div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Icon icon="lucide:check" className="h-4 w-4 text-success" />Role-aware workspaces</span><span className="inline-flex items-center gap-1.5"><Icon icon="lucide:check" className="h-4 w-4 text-success" />India-first ₹ and GST</span><span className="inline-flex items-center gap-1.5"><Icon icon="lucide:check" className="h-4 w-4 text-success" />Tenant-aware data</span></div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border bg-surface-raised px-5 py-3"><span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="ml-3 font-mono text-xs text-muted-foreground">billing overview</span></div>
          <div className="grid gap-4 p-5 sm:grid-cols-2"><div className="rounded-md border border-border bg-input p-4"><p className="text-xs text-muted-foreground">Monthly recurring revenue</p><p className="mt-1 font-headings text-3xl font-bold tabular-nums">₹78,200</p><p className="mt-2 text-xs text-success">Active billing cycle</p></div><div className="rounded-md border border-border bg-input p-4"><p className="text-xs text-muted-foreground">Subscriptions due</p><p className="mt-1 font-headings text-3xl font-bold tabular-nums">12</p><p className="mt-2 text-xs text-warning">Review before billing</p></div><div className="col-span-full rounded-md border border-border bg-input p-4"><div className="mb-4 flex justify-between text-sm"><span className="font-medium">Collection progress</span><span className="font-mono text-muted-foreground">82%</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 w-[82%] rounded-full bg-primary" /></div><div className="mt-4 grid grid-cols-3 gap-3 text-xs"><span className="rounded-sm bg-success/10 p-2 text-success">Paid 48</span><span className="rounded-sm bg-warning/10 p-2 text-warning">Due 9</span><span className="rounded-sm bg-error/10 p-2 text-error">Overdue 3</span></div></div></div>
        </div>
      </section>

      <section id="features" className="border-y border-border bg-surface"><div className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><div className="max-w-2xl"><p className="text-xs font-mono uppercase tracking-widest text-primary">Built for the billing month</p><h2 className="mt-2 font-headings text-3xl font-bold">One connected operating view</h2><p className="mt-3 text-muted-foreground">Move from product setup to payment follow-up without spreadsheets or disconnected handoffs.</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2">{features.map(([icon, title, text]) => <article key={title} className="rounded-xl border border-border bg-background p-5 transition-transform hover:-translate-y-0.5"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon icon={icon} className="h-5 w-5" /></span><h3 className="mt-4 font-headings text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div></div></section>

      <section id="workflow" className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-mono uppercase tracking-widest text-primary">Workflow</p><h2 className="mt-2 font-headings text-3xl font-bold">A practical path from quote to collection</h2><p className="mt-3 text-muted-foreground">Every team sees the next responsible action, while permissions keep financial controls in the right hands.</p></div><ol className="space-y-3">{[['01','Set up products and plans','Define price, variants, availability, and billing terms.'],['02','Send and confirm quotations','Reuse templates and calculate GST, discounts, and totals.'],['03','Manage subscriptions','Track status, renewal dates, pauses, and closures.'],['04','Invoice and collect','Create due invoices, record payments, and follow outstanding balances.']].map(([step,title,text]) => <li key={step} className="grid grid-cols-[40px_1fr] gap-4 rounded-xl border border-border bg-surface p-5"><span className="font-mono text-sm font-bold text-primary">{step}</span><div><h3 className="font-medium">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div></li>)}</ol></div></section>

      <section className="border-y border-border bg-primary text-primary-foreground"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-5 py-14 sm:px-8 md:flex-row md:items-center"><div><h2 className="font-headings text-3xl font-bold">Ready to set up your billing workspace?</h2><p className="mt-2 text-sm text-primary-foreground/80">Start with products and plans, then grow into the full recurring workflow.</p></div><Link to={ROUTES.REGISTER}><Button size="lg" className="bg-surface text-primary hover:bg-surface-raised">Create account</Button></Link></div></section>

      <section id="faq" className="mx-auto max-w-4xl px-5 py-20 sm:px-8"><p className="text-center text-xs font-mono uppercase tracking-widest text-primary">FAQ</p><h2 className="mt-2 text-center font-headings text-3xl font-bold">Questions before you start</h2><div className="mt-8 divide-y divide-border rounded-xl border border-border bg-surface">{faqs.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium"><span>{question}</span><Icon icon={openFaq === index ? 'lucide:minus' : 'lucide:plus'} className="h-4 w-4 text-primary" /></button>{openFaq === index && <p className="px-5 pb-4 text-sm leading-6 text-muted-foreground">{answer}</p>}</div>)}</div></section>

      <footer className="border-t border-border bg-surface"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4"><div><p className="font-headings font-bold">SubsManager</p><p className="mt-2 text-sm text-muted-foreground">Subscription management for the operational work behind recurring revenue.</p></div><div><p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Product</p><a href="#features" className="mt-3 block text-sm hover:text-primary">Features</a><a href="#workflow" className="mt-2 block text-sm hover:text-primary">Workflow</a></div><div><p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Account</p><Link to={ROUTES.LOGIN} className="mt-3 block text-sm hover:text-primary">Sign in</Link><Link to={ROUTES.REGISTER} className="mt-2 block text-sm hover:text-primary">Register</Link></div><div><p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Contact</p><p className="mt-3 text-sm text-muted-foreground">Support contact to be configured by the Brightloop team.</p></div></div><div className="border-t border-border px-5 py-4 text-center text-xs text-muted-foreground">© 2026 SubsManager. Product workflow for the Odoo x Kochi challenge.</div></footer>
    </main>
  );
}
