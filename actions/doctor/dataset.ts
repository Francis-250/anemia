"use server";

import { requireDoctorAction } from "@/lib/doctor-auth";
import prisma from "@/lib/prisma";

export interface CsvPatientRecord {
  id?: string;
  patientName: string;
  age?: number | string;
  gender?: string;
  hemoglobin?: number | string;
  rbcCount?: number | string;
  mcv?: number | string;
  fatigue?: boolean | string;
  dizziness?: boolean | string;
  paleSkin?: boolean | string;
  shortnessOfBreath?: boolean | string;
  heavyMenstruation?: boolean | string;
  lowIronDiet?: boolean | string;
  bloodLoss?: boolean | string;
  chronicDisease?: boolean | string;
  notes?: string;
}

export interface BatchPredictionResult {
  id: string;
  patientName: string;
  age: number | string;
  gender: string;
  hemoglobin: number | null;
  rbcCount: number | null;
  mcv: number | null;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  confidenceScore: number;
  fastScore: number;
  detectedFactors: string[];
  clinicalAnalysis: string;
  recommendation: string;
}

export interface DatasetAnalysisSummary {
  id?: string;
  fileName?: string;
  createdAt?: string;
  doctorName?: string;
  totalRecords: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  anemiaPrevalencePercent: number;
  avgConfidenceScore: number;
  results: BatchPredictionResult[];
}

function parseBool(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val > 0;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "y";
  }
  return false;
}

function parseNum(val: unknown): number | null {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.trim());
    return !isNaN(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Evaluates a batch of patient dataset records and persists the dataset analysis run into the database.
 */
export async function analyzeCsvDataset(
  records: CsvPatientRecord[],
  fileName: string = "uploaded-dataset.csv",
  rawCsvData: string = "",
): Promise<DatasetAnalysisSummary> {
  const session = await requireDoctorAction();

  if (!records || records.length === 0) {
    throw new Error("No valid patient records provided in the CSV dataset.");
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!doctorProfile) {
    throw new Error("Doctor profile not found.");
  }

  const results: BatchPredictionResult[] = records.map((rec, index) => {
    const patientName = rec.patientName?.trim() || `Patient #${index + 1}`;
    const age = rec.age ? String(rec.age).trim() : "Unspecified";
    const gender = rec.gender ? String(rec.gender).trim() : "Unspecified";
    const hb = parseNum(rec.hemoglobin);
    const rbc = parseNum(rec.rbcCount);
    const mcv = parseNum(rec.mcv);

    const fatigue = parseBool(rec.fatigue);
    const dizziness = parseBool(rec.dizziness);
    const paleSkin = parseBool(rec.paleSkin);
    const shortnessOfBreath = parseBool(rec.shortnessOfBreath);
    const heavyMenstruation = parseBool(rec.heavyMenstruation);
    const lowIronDiet = parseBool(rec.lowIronDiet);
    const bloodLoss = parseBool(rec.bloodLoss);
    const chronicDisease = parseBool(rec.chronicDisease);

    const detectedFactors: string[] = [];
    if (fatigue) detectedFactors.push("Fatigue / Tiredness");
    if (dizziness) detectedFactors.push("Dizziness");
    if (paleSkin) detectedFactors.push("Pale Skin / Lips");
    if (shortnessOfBreath) detectedFactors.push("Shortness of Breath");
    if (heavyMenstruation) detectedFactors.push("Heavy Menstrual Bleeding");
    if (lowIronDiet) detectedFactors.push("Low Iron Diet");
    if (bloodLoss) detectedFactors.push("History of Blood Loss");
    if (chronicDisease) detectedFactors.push("Chronic Disease");

    if (hb !== null) {
      if (hb < 12) detectedFactors.push(`Low Hemoglobin (${hb} g/dL)`);
    }
    if (mcv !== null && mcv < 80) {
      detectedFactors.push(`Low MCV (${mcv} fL - Microcytic)`);
    }

    // Scoring & Risk Classification
    let riskPoints = 0;

    // Lab Values Impact
    if (hb !== null) {
      if (hb < 8.0) riskPoints += 4;
      else if (hb < 11.0) riskPoints += 3;
      else if (hb < 12.0) riskPoints += 2;
    }

    if (mcv !== null && mcv < 80) riskPoints += 1.5;
    if (rbc !== null && rbc < 4.0) riskPoints += 1;

    // Symptom Impact
    if (fatigue) riskPoints += 1;
    if (shortnessOfBreath) riskPoints += 1.5;
    if (paleSkin) riskPoints += 1;
    if (dizziness) riskPoints += 1;
    if (heavyMenstruation) riskPoints += 1.5;
    if (lowIronDiet) riskPoints += 1;
    if (bloodLoss) riskPoints += 1.5;
    if (chronicDisease) riskPoints += 1;

    let riskLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    let confidenceScore = 0.85;

    if (riskPoints >= 4 || (hb !== null && hb < 10.0)) {
      riskLevel = "HIGH";
      confidenceScore = Math.min(0.98, 0.88 + riskPoints * 0.015);
    } else if (riskPoints >= 2 || (hb !== null && hb < 12.0)) {
      riskLevel = "MEDIUM";
      confidenceScore = Math.min(0.92, 0.82 + riskPoints * 0.02);
    } else {
      riskLevel = "LOW";
      confidenceScore = Math.min(0.90, 0.80 + (4 - riskPoints) * 0.02);
    }

    const fastScore = Math.min(
      4,
      (lowIronDiet ? 1 : 0) +
        (fatigue || shortnessOfBreath ? 1 : 0) +
        (bloodLoss || heavyMenstruation ? 1 : 0) +
        (chronicDisease || (hb !== null && hb < 11) ? 1 : 0),
    );

    let clinicalAnalysis = "";
    if (riskLevel === "HIGH") {
      clinicalAnalysis = `Patient presents critical risk indicators${hb !== null ? ` including a low Hemoglobin concentration of ${hb} g/dL` : ""}. Multiple symptoms (${detectedFactors.join(", ")}) align with severe anemia profile requiring urgent laboratory confirmation (CBC, Serum Ferritin).`;
    } else if (riskLevel === "MEDIUM") {
      clinicalAnalysis = `Patient exhibits moderate anemia risk factors (${detectedFactors.join(", ")}). Clinical evaluation and routine blood count testing recommended to monitor iron levels.`;
    } else {
      clinicalAnalysis = `Patient demonstrates a low risk profile with minimal clinical indicators flagged. Continued wellness monitoring and balanced nutritional intake recommended.`;
    }

    let recommendation = "";
    if (riskLevel === "HIGH") {
      recommendation = "Recommend prompt clinical evaluation, Complete Blood Count (CBC), and iron panel testing.";
    } else if (riskLevel === "MEDIUM") {
      recommendation = "Recommend routine healthcare consultation and baseline blood test monitoring.";
    } else {
      recommendation = "Maintain healthy dietary iron intake and monitor for any future onset of symptoms.";
    }

    return {
      id: rec.id || `PAT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      patientName,
      age,
      gender,
      hemoglobin: hb,
      rbcCount: rbc,
      mcv,
      riskLevel,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      fastScore,
      detectedFactors,
      clinicalAnalysis,
      recommendation,
    };
  });

  const highRiskCount = results.filter((r) => r.riskLevel === "HIGH").length;
  const mediumRiskCount = results.filter((r) => r.riskLevel === "MEDIUM").length;
  const lowRiskCount = results.filter((r) => r.riskLevel === "LOW").length;

  const totalRecords = results.length;
  const anemiaPrevalencePercent =
    Math.round(((highRiskCount + mediumRiskCount) / totalRecords) * 1000) / 10;
  const avgConfidenceScore =
    Math.round(
      (results.reduce((acc, r) => acc + r.confidenceScore, 0) / totalRecords) *
        100,
    ) / 100;

  const summary: DatasetAnalysisSummary = {
    totalRecords,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    anemiaPrevalencePercent,
    avgConfidenceScore,
    results,
  };

  // Persist dataset run in Database
  const savedDataset = await prisma.doctorDataset.create({
    data: {
      fileName,
      doctorProfileId: doctorProfile.id,
      totalRecords,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      anemiaPrevalencePercent,
      avgConfidenceScore,
      rawCsvData,
      analysisSummaryJson: JSON.stringify(summary),
    },
  });

  summary.id = savedDataset.id;
  summary.fileName = savedDataset.fileName;
  summary.createdAt = savedDataset.createdAt.toISOString();

  return summary;
}

/**
 * Fetch all saved dataset uploads for the authenticated doctor.
 */
export async function getDoctorSavedDatasets() {
  const session = await requireDoctorAction();

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!doctorProfile) return [];

  const datasets = await prisma.doctorDataset.findMany({
    where: { doctorProfileId: doctorProfile.id },
    orderBy: { createdAt: "desc" },
  });

  return datasets.map((d) => ({
    id: d.id,
    fileName: d.fileName,
    totalRecords: d.totalRecords,
    highRiskCount: d.highRiskCount,
    mediumRiskCount: d.mediumRiskCount,
    lowRiskCount: d.lowRiskCount,
    anemiaPrevalencePercent: d.anemiaPrevalencePercent,
    avgConfidenceScore: d.avgConfidenceScore,
    createdAt: d.createdAt.toISOString(),
  }));
}

/**
 * Get full analysis details for a saved dataset by ID.
 */
export async function getSavedDatasetAnalysisById(id: string): Promise<DatasetAnalysisSummary | null> {
  await requireDoctorAction();

  const dataset = await prisma.doctorDataset.findUnique({
    where: { id },
    include: {
      doctorProfile: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!dataset) return null;

  try {
    const summary: DatasetAnalysisSummary = JSON.parse(dataset.analysisSummaryJson);
    summary.id = dataset.id;
    summary.fileName = dataset.fileName;
    summary.createdAt = dataset.createdAt.toISOString();
    summary.doctorName = dataset.doctorProfile.user.name;
    return summary;
  } catch {
    return null;
  }
}
