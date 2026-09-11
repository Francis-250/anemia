"use client";

import { useState, useTransition, ChangeEvent, DragEvent, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Info,
  RefreshCw,
  Search,
  UploadCloud,
} from "lucide-react";
import {
  analyzeCsvDataset,
  getDoctorSavedDatasets,
  getSavedDatasetAnalysisById,
  BatchPredictionResult,
  CsvPatientRecord,
  DatasetAnalysisSummary,
} from "@/actions/doctor/dataset";
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

const SAMPLE_CSV_CONTENT = `Patient Name,Age,Gender,Hemoglobin,RBC Count,MCV,Fatigue,Dizziness,Pale Skin,Shortness of Breath,Heavy Menstruation,Low Iron Diet,History of Blood Loss,Chronic Disease
Sarah Connor,29,Female,9.4,3.5,74,Yes,Yes,Yes,No,Yes,Yes,No,No
John Hammond,65,Male,13.8,4.8,88,No,No,No,No,No,No,No,No
Elena Rostova,42,Female,8.1,3.1,70,Yes,Yes,Yes,Yes,Yes,No,Yes,No
Marcus Vance,51,Male,11.2,4.1,81,Yes,No,No,No,No,Yes,No,Yes
Amina Said,23,Female,12.5,4.5,85,No,No,No,No,No,No,No,No
David Kim,38,Male,7.5,2.9,68,Yes,Yes,Yes,Yes,No,No,Yes,No`;

interface SavedDatasetItem {
  id: string;
  fileName: string;
  totalRecords: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  anemiaPrevalencePercent: number;
  avgConfidenceScore: number;
  createdAt: string;
}

export function DoctorDatasetAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [parsedData, setParsedData] = useState<CsvPatientRecord[]>([]);
  const [summary, setSummary] = useState<DatasetAnalysisSummary | null>(null);
  const [savedList, setSavedList] = useState<SavedDatasetItem[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [selectedPatient, setSelectedPatient] = useState<BatchPredictionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load saved dataset runs on mount
  useEffect(() => {
    getDoctorSavedDatasets().then((items) => {
      setSavedList(items);
      if (items.length > 0) {
        // Load latest dataset by default
        getSavedDatasetAnalysisById(items[0].id).then((res) => {
          if (res) {
            setSummary(res);
            setActiveSavedId(res.id || items[0].id);
          }
        });
      }
    });
  }, []);

  const handleSelectSavedDataset = (id: string) => {
    setActiveSavedId(id);
    startTransition(async () => {
      const res = await getSavedDatasetAnalysisById(id);
      if (res) setSummary(res);
    });
  };

  // Helper to parse simple CSV text into objects
  const parseCsvText = (text: string): CsvPatientRecord[] => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      throw new Error("CSV file must contain a header row and at least one patient record.");
    }

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

    const findCol = (keys: string[]) => {
      return headers.findIndex((h) =>
        keys.some((k) => h.includes(k.toLowerCase())),
      );
    };

    const nameIdx = findCol(["patient name", "name", "patient"]);
    const ageIdx = findCol(["age"]);
    const genderIdx = findCol(["gender", "sex"]);
    const hbIdx = findCol(["hemoglobin", "hb"]);
    const rbcIdx = findCol(["rbc", "red blood cell"]);
    const mcvIdx = findCol(["mcv"]);
    const fatigueIdx = findCol(["fatigue", "tired"]);
    const dizzinessIdx = findCol(["dizziness", "dizzy"]);
    const paleIdx = findCol(["pale", "paleness"]);
    const breathIdx = findCol(["shortness of breath", "breath"]);
    const heavyMenstruationIdx = findCol(["heavy menstruation", "menstrual", "period"]);
    const lowIronIdx = findCol(["low iron", "diet"]);
    const bloodLossIdx = findCol(["blood loss", "bleeding"]);
    const chronicIdx = findCol(["chronic", "disease"]);

    const records: CsvPatientRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map((v) =>
        v.trim().replace(/^["']|["']$/g, ""),
      );

      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const record: CsvPatientRecord = {
        patientName: nameIdx !== -1 && values[nameIdx] ? values[nameIdx] : `Patient #${i}`,
        age: ageIdx !== -1 ? values[ageIdx] : "",
        gender: genderIdx !== -1 ? values[genderIdx] : "",
        hemoglobin: hbIdx !== -1 ? values[hbIdx] : "",
        rbcCount: rbcIdx !== -1 ? values[rbcIdx] : "",
        mcv: mcvIdx !== -1 ? values[mcvIdx] : "",
        fatigue: fatigueIdx !== -1 ? values[fatigueIdx] : false,
        dizziness: dizzinessIdx !== -1 ? values[dizzinessIdx] : false,
        paleSkin: paleIdx !== -1 ? values[paleIdx] : false,
        shortnessOfBreath: breathIdx !== -1 ? values[breathIdx] : false,
        heavyMenstruation: heavyMenstruationIdx !== -1 ? values[heavyMenstruationIdx] : false,
        lowIronDiet: lowIronIdx !== -1 ? values[lowIronIdx] : false,
        bloodLoss: bloodLossIdx !== -1 ? values[bloodLossIdx] : false,
        chronicDisease: chronicIdx !== -1 ? values[chronicIdx] : false,
      };

      records.push(record);
    }

    return records;
  };

  const handleFileProcess = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please select a valid CSV (.csv) file.");
      return;
    }

    setError(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        setRawText(text);
        const records = parseCsvText(text);
        setParsedData(records);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV file.");
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRunAnalysis = () => {
    if (parsedData.length === 0 || isPending) return;
    setError(null);

    startTransition(async () => {
      try {
        const fileName = file?.name || "dataset.csv";
        const result = await analyzeCsvDataset(parsedData, fileName, rawText);
        setSummary(result);
        if (result.id) setActiveSavedId(result.id);

        // Refresh saved list
        const updatedList = await getDoctorSavedDatasets();
        setSavedList(updatedList);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Dataset analysis failed. Please verify file formatting.",
        );
      }
    });
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample-anemia-dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportResults = () => {
    if (!summary) return;

    const headers = [
      "Patient ID",
      "Patient Name",
      "Age",
      "Gender",
      "Hemoglobin (g/dL)",
      "RBC Count",
      "MCV (fL)",
      "Predicted Risk Level",
      "Confidence Score (%)",
      "FAST Indicator Score",
      "Detected Factors",
      "Clinical Guidance",
    ];

    const rows = summary.results.map((r) => [
      `"${r.id}"`,
      `"${r.patientName}"`,
      `"${r.age}"`,
      `"${r.gender}"`,
      `"${r.hemoglobin ?? "N/A"}"`,
      `"${r.rbcCount ?? "N/A"}"`,
      `"${r.mcv ?? "N/A"}"`,
      `"${r.riskLevel}"`,
      `"${Math.round(r.confidenceScore * 100)}%"`,
      `"${r.fastScore}/4"`,
      `"${r.detectedFactors.join("; ")}"`,
      `"${r.recommendation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `anemia-predictions-${summary.fileName || "dataset"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = summary
    ? summary.results.filter((r) => {
        const matchesSearch =
          r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk =
          filterRisk === "ALL" || r.riskLevel === filterRisk;
        return matchesSearch && matchesRisk;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileSpreadsheet className="size-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">
                Upload & Analyze New CSV Dataset
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload patient clinical datasets to evaluate machine learning anemia risk predictions. Saved runs will remain accessible in your account and to system administrators.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            className="text-xs gap-1.5"
          >
            <Download size={13} /> Sample CSV Template
          </Button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 bg-muted/20",
          )}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <UploadCloud size={20} />
          </div>
          <p className="text-sm font-medium">
            {file ? file.name : "Drag & drop your CSV dataset file here"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB · ${parsedData.length} records ready`
              : "Click or drag a .csv file to process"}
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {parsedData.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText size={14} />
              <span>
                <strong className="text-foreground">{parsedData.length}</strong> patient records loaded from {file?.name}
              </span>
            </div>
            <Button
              onClick={handleRunAnalysis}
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <span className="size-4 rounded-full border-2 border-background/40 border-t-background animate-spin" />
                  Running AI Risk Predictions...
                </>
              ) : (
                <>
                  <RefreshCw size={14} /> Run & Save Dataset Analysis
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Saved Datasets History Bar */}
      {savedList.length > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock size={13} /> Your Saved Dataset Runs ({savedList.length})
            </p>
            <span className="text-[11px] text-muted-foreground">
              Persisted in Database & Viewable by Admin
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedList.map((item) => {
              const active = item.id === activeSavedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSavedDataset(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary font-medium"
                      : "bg-background hover:bg-muted text-foreground border-border",
                  )}
                >
                  <FileSpreadsheet size={13} />
                  <div>
                    <p className="font-semibold truncate max-w-[140px]">{item.fileName}</p>
                    <p className={cn("text-[10px]", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {item.totalRecords} records · {item.highRiskCount} High Risk
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Results Summary */}
      {summary && (
        <div className="space-y-6">
          {summary.fileName && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold">
                  Dataset Analysis Result
                </Badge>
                <span className="text-sm font-semibold">{summary.fileName}</span>
                {summary.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    ({new Date(summary.createdAt).toLocaleDateString()})
                  </span>
                )}
              </div>
              <Badge variant="secondary" className="text-[11px]">
                Saved to DB & Shared with Admin
              </Badge>
            </div>
          )}

          {/* Summary Metric Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Records
              </p>
              <p className="mt-2 text-2xl font-bold">{summary.totalRecords}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(summary.avgConfidenceScore * 100)}% avg confidence
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-sm border-red-200/60 bg-red-50/20">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-red-700 uppercase tracking-wider">
                  High Risk Patients
                </p>
                <Badge variant="destructive" className="text-[10px]">
                  Requires Review
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-red-700">
                {summary.highRiskCount}
              </p>
              <p className="mt-1 text-xs text-red-600/80">
                {Math.round((summary.highRiskCount / summary.totalRecords) * 100)}% of dataset
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-sm border-amber-200/60 bg-amber-50/20">
              <p className="text-xs font-medium text-amber-800 uppercase tracking-wider">
                Moderate Risk Patients
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-800">
                {summary.mediumRiskCount}
              </p>
              <p className="mt-1 text-xs text-amber-700/80">
                {Math.round((summary.mediumRiskCount / summary.totalRecords) * 100)}% of dataset
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-sm border-emerald-200/60 bg-emerald-50/20">
              <p className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
                Low Risk Patients
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-800">
                {summary.lowRiskCount}
              </p>
              <p className="mt-1 text-xs text-emerald-700/80">
                {Math.round((summary.lowRiskCount / summary.totalRecords) * 100)}% of dataset
              </p>
            </div>
          </div>

          {/* Results Table Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            {/* Table Controls */}
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3 bg-muted/20">
              <div className="flex flex-wrap items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Search patient name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-xs h-9 bg-background"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
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

                <Button
                  size="sm"
                  onClick={handleExportResults}
                  className="text-xs gap-1.5"
                >
                  <Download size={13} /> Export CSV
                </Button>
              </div>
            </div>

            {/* Patients Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Demographics</th>
                    <th className="px-4 py-3">Hemoglobin</th>
                    <th className="px-4 py-3">Predicted Risk</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">FAST Indicators</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No patient records match the selected filter.
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
                          {r.hemoglobin !== null ? (
                            <span className={cn(r.hemoglobin < 11 ? "text-red-600 font-semibold" : "text-foreground")}>
                              {r.hemoglobin} g/dL
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">N/A</span>
                          )}
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
                        <td className="px-4 py-3 text-muted-foreground">
                          {r.fastScore}/4
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
        </div>
      )}

      {/* Patient Detail Modal */}
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
              {/* Lab metrics */}
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

              {/* Factors */}
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

              {/* Analysis */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Clinical AI Explanation
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {formatPlainText(selectedPatient.clinicalAnalysis)}
                </p>
              </div>

              {/* Guidance */}
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
