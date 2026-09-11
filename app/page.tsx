import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileSpreadsheet,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-rose-600 text-white">
              <HeartPulse size={18} />
            </span>
            <span className="text-base font-semibold tracking-tight">AnemiaRisk AI</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#for-doctors" className="hover:text-foreground transition-colors">For Care Teams</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="bg-rose-600 hover:bg-rose-700 text-white border-0">
              <Link href="/auth/register" className="flex items-center gap-1">
                <span>Get started</span>
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Simple Hero Section */}
        <section className="border-b bg-gradient-to-b from-rose-500/5 via-background to-background py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
            <Badge variant="outline" className="rounded-full px-3.5 py-1 text-xs border-rose-500/30 text-rose-600 dark:text-rose-400 font-normal">
              Anemia Screening & Clinical Decision Support
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Simple Anemia Risk Screening & Doctor Consultation
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              Record symptoms and hemoglobin levels, receive preliminary risk assessments, and connect with verified doctors for medical review.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-rose-600 hover:bg-rose-700 text-white h-11 px-6">
                <Link href="/auth/register" className="flex items-center gap-2">
                  <span>Start Anemia Check</span>
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-6">
                <Link href="/auth/login">Doctor & Admin Login</Link>
              </Button>
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck size={15} className="text-rose-500 shrink-0" />
              <span>Preliminary screening tool · Not a replacement for laboratory blood tests</span>
            </div>
          </div>
        </section>

        {/* 3 Step Workflow */}
        <section id="how-it-works" className="py-16 sm:py-20 border-b">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Simple Process</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How AnemiaRisk AI Works</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border p-6 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                    <ClipboardCheck size={18} />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">01</span>
                </div>
                <h3 className="text-lg font-semibold">1. Enter Symptoms & Info</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fill in basic demographics, symptoms (fatigue, dizziness), and blood count numbers if available.
                </p>
              </div>

              <div className="rounded-xl border p-6 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                    <Activity size={18} />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">02</span>
                </div>
                <h3 className="text-lg font-semibold">2. Get Risk Estimate</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The system evaluates your inputs to estimate Low, Moderate, or High anemia risk with confidence scoring.
                </p>
              </div>

              <div className="rounded-xl border p-6 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                    <Stethoscope size={18} />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">03</span>
                </div>
                <h3 className="text-lg font-semibold">3. Consult a Doctor</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Share your results with an assigned doctor for clinical guidance, evaluation, and next steps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Features Grid */}
        <section id="features" className="py-16 sm:py-20 border-b bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Key Features</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Built for Patients and Doctors</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border p-6 bg-card space-y-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Users size={20} />
                </div>
                <h3 className="text-base font-semibold">Patient Self-Assessment</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Easy self-assessment questionnaires to track personal anemia risk history over time.
                </p>
              </div>

              <div className="rounded-xl border p-6 bg-card space-y-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <FileSpreadsheet size={20} />
                </div>
                <h3 className="text-base font-semibold">Doctor Dataset Uploads</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Doctors can upload CSV files of patient records to run batch risk predictions and view summary statistics.
                </p>
              </div>

              <div className="rounded-xl border p-6 bg-card space-y-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-base font-semibold">Clinical Oversight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Administrators can manage users, approve doctor verification, and review dataset activity logs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Doctors Section */}
        <section id="for-doctors" className="py-16 sm:py-20 border-b">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-2xl border bg-card p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <Badge variant="outline" className="text-xs border-rose-500/30 text-rose-600 dark:text-rose-400">Medical Professionals</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Are you a Doctor or Healthcare Provider?</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Join our platform to review patient assessments, provide clinical recommendations, and process batch CSV dataset predictions for your clinic or hospital.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Button asChild className="bg-rose-600 hover:bg-rose-700 text-white">
                  <Link href="/auth/doctor-onboarding">Apply as Doctor</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/auth/login">Doctor Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Call to Action */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to get started?</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              Create a free account to complete your first anemia risk screening or log in to your existing portal.
            </p>
            <div className="flex justify-center gap-3">
              <Button asChild size="lg" className="bg-rose-600 hover:bg-rose-700 text-white h-11 px-7">
                <Link href="/auth/register">Create Free Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-6">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-8 bg-card text-muted-foreground text-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse size={16} className="text-rose-600" />
            <span className="font-semibold text-foreground text-sm">AnemiaRisk AI</span>
          </div>
          <p className="text-center sm:text-left max-w-md">
            AnemiaRisk AI is for preliminary risk screening only and is not a medical diagnosis. Please consult a qualified doctor for laboratory blood testing.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/login" className="hover:text-foreground">Sign In</Link>
            <Link href="/auth/register" className="hover:text-foreground">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
