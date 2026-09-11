import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  ClipboardCheck,
  HeartPulse,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
  Microscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const anemiaRiskFactors = [
  { letter: "N", title: "Nutrition", description: "Low intake of iron, vitamin B12, or folate in daily diet." },
  { letter: "S", title: "Symptoms", description: "Frequent fatigue, weakness, dizziness, headache, or pale appearance." },
  { letter: "B", title: "Blood Loss", description: "Heavy menstrual bleeding, recent surgery, or acute blood loss." },
  { letter: "M", title: "Medical History", description: "Chronic illness, pregnancy, infections, or inherited blood disorders." },
];

const workflow = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Record health information",
    description: "Complete a guided assessment including demographics, symptoms, nutritional habits, and medical history.",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI risk prediction",
    description: "Our machine learning model analyzes inputs to estimate Low, Moderate, or High anemia risk with confidence scoring.",
  },
  {
    number: "03",
    icon: UserRoundCheck,
    title: "Connect with a doctor",
    description: "Share your risk assessment with an approved medical professional for clinical guidance and review.",
  },
];

const platformPoints = [
  "Secure patient assessment history",
  "Approved doctor review workflow",
  "High-risk anemia alerts and notifications",
  "Administrative oversight and audit logs",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="AnemiaRisk AI home">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HeartPulse size={16} />
            </span>
            <span className="text-sm font-semibold tracking-tight">AnemiaRisk AI</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
            <a href="#risk-factors" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Risk Factors</a>
            <a href="#for-care-teams" className="text-sm text-muted-foreground transition-colors hover:text-foreground">For care teams</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/register">Get started <ArrowRight size={14} /></Link>
            </Button>
            <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Browse page sections" asChild>
              <a href="#how-it-works"><Menu size={17} /></a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-32">
            <div>
              <Badge variant="outline" className="mb-6 rounded-full px-3 py-1 font-normal">
                <Activity size={12} /> Machine Learning Health Screening
              </Badge>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                AI-Based Anemia Risk Prediction System
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                AnemiaRisk AI helps patients record symptoms, nutritional factors, and medical history to estimate anemia risk levels and share predictions with qualified doctors.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/register">Start an anemia check <ArrowRight size={15} /></Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#risk-factors">Learn anemia risk factors</a>
                </Button>
              </div>
              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                AnemiaRisk AI provides preliminary risk screening. It is not a medical diagnosis. A confirmed diagnosis requires clinical evaluation and laboratory blood testing.
              </p>
            </div>

            <div className="relative">
              <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between border-b pb-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Assessment preview</p>
                    <p className="mt-1 text-sm font-medium">Anemia risk summary</p>
                  </div>
                  <Badge variant="destructive">High risk</Badge>
                </div>
                <div className="grid gap-6 py-6 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="flex size-28 flex-col items-center justify-center rounded-full border-[6px] border-destructive/20">
                    <span className="text-2xl font-semibold">88%</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Key indicators</span>
                        <span className="font-medium">4 of 4</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {["N", "S", "B", "M"].map((letter) => (
                          <span
                            key={letter}
                            className="flex h-8 items-center justify-center rounded-md border border-destructive/30 bg-destructive/10 text-xs font-semibold text-destructive"
                          >
                            {letter}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs text-muted-foreground">Detected factors</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["Fatigue & Weakness", "Dizziness", "Low Iron Diet", "Heavy Menstruation"].map((sign) => (
                          <span key={sign} className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">{sign}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-xs font-medium text-destructive">Seek professional medical assessment</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Your information indicates an increased risk of anemia. Please consult a doctor for laboratory blood testing.</p>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden w-52 rounded-lg border bg-background p-4 shadow-sm sm:block">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-muted"><Stethoscope size={13} /></span>
                  <div>
                    <p className="text-xs font-medium">Doctor review</p>
                    <p className="text-[10px] text-muted-foreground">Assigned & notified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b bg-muted/30">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px border-x bg-border sm:grid-cols-4">
            {[
              ["Patients", "Guided anemia risk screening"],
              ["Doctors", "Clinical review & feedback"],
              ["Administrators", "User & AI system management"],
              ["Every prediction", "Non-diagnostic risk estimate"],
            ].map(([title, description]) => (
              <div key={title} className="bg-background p-5 sm:p-6">
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-b">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From symptoms to a reviewed risk prediction</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">A transparent machine learning workflow designed to help people assess anemia risk and connect with qualified doctors.</p>
            </div>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {workflow.map(({ number, icon: Icon, title, description }) => (
                <div key={number} className="rounded-lg border p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-md bg-muted"><Icon size={16} /></span>
                    <span className="font-mono text-xs text-muted-foreground">{number}</span>
                  </div>
                  <h3 className="mt-8 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="risk-factors" className="scroll-mt-20 border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Understand the condition</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Anemia Risk Indicators</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Anemia occurs when hemoglobin levels or red blood cell counts drop below normal. Recognizing symptoms and nutritional factors early is key.
              </p>
              <div className="mt-7 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <Microscope size={17} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Laboratory confirmation required</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">AI predictions provide risk estimates. Proper diagnosis requires blood tests such as Hemoglobin and Complete Blood Count (CBC).</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {anemiaRiskFactors.map((step) => (
                <div key={step.letter} className="flex gap-4 rounded-lg border p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">{step.letter}</span>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="for-care-teams" className="scroll-mt-20 border-b bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
            <div className="rounded-xl border bg-background p-5 sm:p-7">
              <div className="flex items-center gap-3 border-b pb-5">
                <span className="flex size-9 items-center justify-center rounded-md bg-muted"><MessageSquareText size={16} /></span>
                <div>
                  <p className="text-sm font-medium">Connected care workflow</p>
                  <p className="text-xs text-muted-foreground">Built around clear clinical responsibility</p>
                </div>
              </div>
              <div className="divide-y">
                {[
                  ["Patient", "Completes anemia risk assessment and selects an approved doctor."],
                  ["Doctor", "Reviews assigned predictions, symptoms, history, and provides recommendations."],
                  ["Administrator", "Approves doctors, monitors AI usage, datasets, and platform audit logs."],
                ].map(([role, detail]) => (
                  <div key={role} className="flex gap-4 py-5">
                    <Check size={15} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{role}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">One coordinated platform</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Insightful for patients. Actionable for care teams.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                AnemiaRisk AI brings assessment history, ML risk scoring, doctor assignments, clinical feedback, and administrative controls into one seamless platform.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {platformPoints.map((point) => (
                  <div key={point} className="flex items-center gap-2.5 text-sm">
                    <span className="flex size-5 items-center justify-center rounded-full border"><Check size={11} /></span>
                    {point}
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-8">
                <Link href="/auth/register">Create an account <ChevronRight size={14} /></Link>
              </Button>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="rounded-xl border bg-primary px-6 py-12 text-primary-foreground sm:px-10 sm:py-14">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/60">Start today</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Screen your anemia risk with Machine Learning.</h2>
                  <p className="mt-4 text-sm leading-6 text-primary-foreground/70">Create your secure account, complete your health profile, and receive AI-driven risk predictions.</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/auth/register">Create account <ArrowRight size={15} /></Link>
                  </Button>
                  <Button asChild size="lg" className="border border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <HeartPulse size={15} />
            <span className="text-sm font-medium">AnemiaRisk AI</span>
          </div>
          <p className="max-w-xl text-xs leading-5 text-muted-foreground">For preliminary screening and awareness only. This is not a medical diagnosis. Please consult a healthcare professional for clinical assessment and laboratory blood testing.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/auth/register" className="hover:text-foreground">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
