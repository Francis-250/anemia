"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  Clock,
  Download,
  FileSpreadsheet,
  Filter,
  Info,
  Search,
  UserCheck,
} from "lucide-react";
import {
  AdminDatasetListItem,
  getAdminDatasetAnalysisById,
} from "@/actions/admin/datasets";
import { BatchPredictionResult, DatasetAnalysisSummary } from "@/actions/doctor/dataset";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPlainText } from "@/lib/format-text";
import { cn } from "@/lib/utils";

interface AdminDatasetsClientProps {
  initialDatasets: AdminDatasetListItem[];
}

export function AdminDatasetsClient({ initialDatasets }: AdminDatasetsClientProps) {
  const [datasets] = useState<AdminDatasetListItem[]>(initialDatasets);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(
    initialDatasets.length > 0 ? initialDatasets[0].id : null,
  );
  const [activeSummary, setActiveSummary] = useState<DatasetAnalysisSummary | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<BatchPredictionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");

  const handleSelectDataset = (id: string) => {
    setActiveDatasetId(id);
    startTransition(async () => {
      const summary = await getAdminDatasetAnalysisById(id);
      setActiveSummary(summary);
    });
  };

  // Load first dataset on mount if available
  useEffect(() => {
    if (initialDatasets.length > 0) {
      getAdminDatasetAnalysisById(initialDatasets[0].id).then((res) => {
        if (res) setActiveSummary(res);
      });
    }
  }, [initialDatasets]);

  const activeDatasetInfo = datasets.find((d) => d.id === activeDatasetId);

  const filteredResults = activeSummary
    ? activeSummary.results.filter((r) => {
        const matchesSearch =
          r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk =
          filterRisk === "ALL" || r.riskLevel === filterRisk;
        return matchesSearch && matchesRisk;
      })
    : [];

  const handleExportCsv = () => {
    if (!activeSummary) return;

    const headers = [
      "Patient ID",
      "Patient Name",
      "Age",
      "Gender",
      "Hemoglobin",
      "RBC Count",
      "MCV",
      "Risk Level",
      "Confidence (%)",
      "Detected Factors",
      "Recommendation",
    ];

    const rows = activeSummary.results.map((r) => [
      `"${r.id}"`,
      `"${r.patientName}"`,
      `"${r.age}"`,
      `"${r.gender}"`,
      `"${r.hemoglobin ?? "N/A"}"`,
      `"${r.rbcCount ?? "N/A"}"`,
      `"${r.mcv ?? "N/A"}"`,
      `"${r.riskLevel}"`,
      `"${Math.round(r.confidenceScore * 100)}%"`,
      `"${r.detectedFactors.join("; ")}"`,
      `"${r.recommendation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `admin-${activeSummary.fileName || "dataset"}-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {datasets.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <FileSpreadsheet className="mx-auto size-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-semibold">No Uploaded Datasets Yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            When doctors upload CSV datasets for batch anemia risk predictions, their dataset runs and analytical reports will appear here for administrative oversight.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Saved Datasets Sidebar List */}
          <div className="space-y-3 lg:col-span-1">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-primary" /> Doctor Uploaded Datasets
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {datasets.length} Total
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Select a doctor dataset upload run to inspect batch risk predictions and clinical analytics.
              </p>

              <div className="space-y-2 max-h-[34rem] overflow-y-auto pr-1">
                {datasets.map((d) => {
                  const active = d.id === activeDatasetId;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectDataset(d.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-colors",
                        active
                          ? "bg-primary/10 border-primary text-foreground"
                          : "bg-background hover:bg-muted/50 border-border text-foreground",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold truncate">{d.fileName}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] shrink-0 font-semibold",
                            d.highRiskCount > 0
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-green-50 text-green-700 border-green-200",
                          )}
                        >
                          {d.highRiskCount} High Risk
                        </Badge>
                      </div>
                      <p className="text-[11px] font-medium text-foreground/90 truncate">
                        Dr. {d.doctorName} ({d.specialization})
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-between">
                        <span>{d.totalRecords} Records · {d.anemiaPrevalencePercent}% Prevalence</span>
                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dataset Analysis Detail Section */}
          <div className="lg:col-span-2 space-y-6">
            {activeDatasetInfo && activeSummary && (
              <>
                {/* Header Banner */}
                <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-semibold">
                          Dataset Inspection
                        </Badge>
                        <h2 className="text-lg font-bold">{activeDatasetInfo.fileName}</h2>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uploaded by <strong className="text-foreground">Dr. {activeDatasetInfo.doctorName}</strong> ({activeDatasetInfo.doctorEmail} · {activeDatasetInfo.hospitalName})
                      </p>
                    </div>
                    <Button size="sm" onClick={handleExportCsv} className="text-xs gap-1.5">
                      <Download size={13} /> Export CSV
                    </Button>
                  </div>

                  <Separator />

                  {/* Summary Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-lg bg-muted/30 p-3 border">
                      <p className="text-muted-foreground">Total Patients</p>
                      <p className="text-xl font-bold mt-0.5">{activeSummary.totalRecords}</p>
                    </div>
                    <div className="rounded-lg bg-red-50/50 p-3 border border-red-200/60">
                      <p className="text-red-700 font-medium">High Risk</p>
                      <p className="text-xl font-bold text-red-700 mt-0.5">{activeSummary.highRiskCount}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50/50 p-3 border border-amber-200/60">
                      <p className="text-amber-800 font-medium">Moderate Risk</p>
                      <p className="text-xl font-bold text-amber-800 mt-0.5">{activeSummary.mediumRiskCount}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50/50 p-3 border border-emerald-200/60">
                      <p className="text-emerald-800 font-medium">Low Risk</p>
                      <p className="text-xl font-bold text-emerald-800 mt-0.5">{activeSummary.lowRiskCount}</p>
                    </div>
                  </div>
                </div>

                {/* Patient Results Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3 bg-muted/20">
                    <div className="relative w-full max-w-sm">
                      <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                      <Input
                        placeholder="Search patient name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 text-xs h-9 bg-background"
                      />
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border p-1 bg-background">
                      <Filter size={13} className="text-muted-foreground ml-1.5 mr-1" />
                      {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFilterRisk(lvl)}
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                            filterRisk === lvl
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {lvl === "ALL" ? "All" : lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b">
                        <tr>
                          <th className="px-4 py-3">Patient</th>
                          <th className="px-4 py-3">Demographics</th>
                          <th className="px-4 py-3">Hemoglobin</th>
                          <th className="px-4 py-3">Risk Level</th>
                          <th className="px-4 py-3">Confidence</th>
                          <th className="px-4 py-3 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredResults.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                              No records match the filter.
                            </td>
                          </tr>
                        ) : (
                          filteredResults.map((r) => (
                            <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 font-medium">
                                <p className="text-sm font-semibold text-foreground">{r.patientName}</p>
                                <p className="text-[11px] text-muted-foreground font-mono">{r.id}</p>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {r.gender} · {r.age} yrs
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {r.hemoglobin !== null ? `${r.hemoglobin} g/dL` : "N/A"}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "font-semibold text-[11px]",
                                    r.riskLevel === "HIGH" && "bg-red-50 text-red-700 border-red-200",
                                    r.riskLevel === "MEDIUM" && "bg-amber-50 text-amber-700 border-amber-200",
                                    r.riskLevel === "LOW" && "bg-green-50 text-green-700 border-green-200",
                                  )}
                                >
                                  {r.riskLevel} RISK
                                </Badge>
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {Math.round(r.confidenceScore * 100)}%
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedPatient(r)}
                                  className="text-xs h-7 px-2.5"
                                >
                                  <Info size={13} className="mr-1" /> View Analysis
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Patient Detail Inspection Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        {selectedPatient && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold",
                    selectedPatient.riskLevel === "HIGH" && "bg-red-50 text-red-700 border-red-200",
                    selectedPatient.riskLevel === "MEDIUM" && "bg-amber-50 text-amber-700 border-amber-200",
                    selectedPatient.riskLevel === "LOW" && "bg-green-50 text-green-700 border-green-200",
                  )}
                >
                  {selectedPatient.riskLevel} RISK
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(selectedPatient.confidenceScore * 100)}% Confidence
                </span>
              </div>
              <DialogTitle className="text-xl font-bold">
                {selectedPatient.patientName}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Patient ID: {selectedPatient.id} · {selectedPatient.gender} · {selectedPatient.age} years old
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded-lg border text-xs">
                <div>
                  <p className="text-muted-foreground">Hemoglobin</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {selectedPatient.hemoglobin !== null ? `${selectedPatient.hemoglobin} g/dL` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">RBC Count</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {selectedPatient.rbcCount !== null ? `${selectedPatient.rbcCount} M/mcL` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">MCV Index</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {selectedPatient.mcv !== null ? `${selectedPatient.mcv} fL` : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Detected Risk Factors
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatient.detectedFactors.length > 0 ? (
                    selectedPatient.detectedFactors.map((factor) => (
                      <span
                        key={factor}
                        className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground font-medium"
                      >
                        {factor}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No significant risk factors flagged</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Clinical AI Explanation
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {formatPlainText(selectedPatient.clinicalAnalysis)}
                </p>
              </div>

              <div className="rounded-lg border p-3 bg-muted/40 text-xs space-y-1">
                <p className="font-semibold text-foreground">Recommended Clinical Guidance</p>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedPatient.recommendation}
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
