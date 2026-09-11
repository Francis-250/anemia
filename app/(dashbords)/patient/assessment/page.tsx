"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Brain,
  Eye,
  HelpCircle,
  Microscope,
  RefreshCw,
  Smile,
  ThumbsDown,
  Droplet,
  HeartPulse,
} from "lucide-react";
import { createAssessment } from "@/actions/patient/assessments";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const symptoms = [
  { id: "fatigue", label: "Tiredness / Fatigue", icon: Activity, indicator: true },
  { id: "weakness", label: "General Weakness", icon: HeartPulse, indicator: true },
  { id: "dizziness", label: "Dizziness / Lightheadedness", icon: RefreshCw, indicator: true },
  { id: "headache", label: "Headache", icon: Brain, indicator: false },
  { id: "shortness_of_breath", label: "Shortness of breath", icon: Activity, indicator: true },
  { id: "pale_skin", label: "Pale skin / lips / nails", icon: Eye, indicator: true },
  { id: "heavy_menstruation", label: "Heavy menstrual bleeding", icon: Droplet, indicator: true },
  { id: "low_iron_diet", label: "Low iron / poor diet", icon: HelpCircle, indicator: true },
  { id: "blood_loss", label: "History of blood loss", icon: ThumbsDown, indicator: true },
  { id: "chronic_disease", label: "Chronic disease", icon: Activity, indicator: false },
  { id: "inherited_disorder", label: "Inherited blood disorder", icon: Microscope, indicator: false },
  { id: "pregnancy", label: "Pregnancy / Postpartum", icon: Smile, indicator: false },
];

export default function Assessment() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((s) => s !== id) : [...p, id],
    );

  const indicatorCount = symptoms.filter(
    (s) => s.indicator && selected.includes(s.id),
  ).length;
  const canSubmit = selected.length > 0 || text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || isPending) return;
    setError(null);

    startTransition(async () => {
      try {
        const result = await createAssessment({
          symptoms: selected,
          symptomsText: text,
        });
        router.push(`/patient/assessment/${result.assessmentId}`);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to create assessment. Please try again.",
        );
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-xs text-muted-foreground mb-1">New risk prediction</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Anemia Risk Assessment
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select all relevant symptoms, nutritional factors, and medical history indicators
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4 order-2 lg:order-1">
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Key Risk Indicators
            </p>
            <div className="flex gap-1.5 mb-3">
              {["N", "S", "B", "M"].map((l, i) => (
                <div
                  key={l}
                  className={cn(
                    "flex-1 h-9 rounded flex items-center justify-center text-xs font-bold transition-colors",
                    i < indicatorCount
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {indicatorCount === 0 && "No primary risk indicators selected"}
              {indicatorCount === 1 && "1 risk indicator selected"}
              {indicatorCount === 2 && "2 risk indicators selected"}
              {indicatorCount >= 3 && "3+ key risk indicators selected"}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              What causes Anemia?
            </p>
            <div className="space-y-2.5">
              {[
                { l: "N", t: "Nutrition", d: "Low iron or vitamin intake" },
                { l: "S", t: "Symptoms", d: "Fatigue, weakness, dizziness" },
                { l: "B", t: "Blood Loss", d: "Heavy periods or blood loss" },
                { l: "M", t: "Medical", d: "Chronic disease or history" },
              ].map(({ l, t, d }) => (
                <div key={l} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded bg-muted text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {l}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{t}</span>:{" "}
                    {d}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed px-0.5">
            This tool provides an AI risk prediction and is not a medical diagnosis. Please consult a qualified doctor for clinical evaluation and laboratory blood testing (Hemoglobin / CBC).
          </p>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2 space-y-5">
          <div className="rounded-lg border p-5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 block">
              Symptoms & Risk Factors
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {symptoms.map(({ id, label, icon: Icon, indicator }) => {
                const active = selected.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(id)}
                    className={cn(
                      "relative flex min-h-10 items-center gap-2.5 px-3 py-2.5 rounded-md border text-sm transition-colors text-left",
                      active
                        ? "bg-primary/5 border-primary text-primary"
                        : "bg-background border-border text-foreground hover:bg-muted/50",
                    )}
                  >
                    {indicator && (
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-amber-600 leading-none">
                        *
                      </span>
                    )}
                    <Icon
                      size={14}
                      className={
                        active ? "text-primary" : "text-muted-foreground"
                      }
                    />
                    <span className="text-xs">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border p-5">
            <Label
              htmlFor="desc"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block"
            >
              Additional medical history or description{" "}
              <span className="normal-case font-normal">(optional)</span>
            </Label>
            <Textarea
              id="desc"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="e.g. I have been feeling constantly exhausted for the past month, experiencing frequent dizziness when standing up..."
              className="resize-none text-sm"
            />
          </div>

          {isPending && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-muted border-t-foreground animate-spin" />
                AI Anemia Risk Analysis in progress
              </div>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluating symptoms, nutritional factors, and medical history with the machine learning model.
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {selected.length > 0
                ? `${selected.length} factor${selected.length > 1 ? "s" : ""} selected`
                : "Nothing selected yet"}
            </p>
            <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
              {isPending ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-background/40 border-t-background animate-spin" />
              ) : (
                <>
                  <span>Predict Risk</span> <ArrowRight size={14} className="ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
