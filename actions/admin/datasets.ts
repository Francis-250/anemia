"use server";

import { requireAdminAction } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { DatasetAnalysisSummary } from "@/actions/doctor/dataset";

export interface AdminDatasetListItem {
  id: string;
  fileName: string;
  doctorName: string;
  doctorEmail: string;
  specialization: string;
  hospitalName: string;
  totalRecords: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  anemiaPrevalencePercent: number;
  avgConfidenceScore: number;
  createdAt: string;
}

/**
 * Fetch all doctor-uploaded dataset runs across the system for Admin inspection.
 */
export async function getAllDoctorUploadedDatasets(): Promise<AdminDatasetListItem[]> {
  await requireAdminAction();

  const datasets = await prisma.doctorDataset.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      doctorProfile: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  return datasets.map((d) => ({
    id: d.id,
    fileName: d.fileName,
    doctorName: d.doctorProfile.user.name,
    doctorEmail: d.doctorProfile.user.email,
    specialization: d.doctorProfile.specialization ?? "Doctor",
    hospitalName: d.doctorProfile.hospitalName ?? "Hospital not specified",
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
 * Get detailed dataset analysis result for an Admin.
 */
export async function getAdminDatasetAnalysisById(
  id: string,
): Promise<DatasetAnalysisSummary | null> {
  await requireAdminAction();

  const dataset = await prisma.doctorDataset.findUnique({
    where: { id },
    include: {
      doctorProfile: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!dataset) return null;

  try {
    const summary: DatasetAnalysisSummary = JSON.parse(
      dataset.analysisSummaryJson,
    );
    summary.id = dataset.id;
    summary.fileName = dataset.fileName;
    summary.createdAt = dataset.createdAt.toISOString();
    summary.doctorName = dataset.doctorProfile.user.name;
    return summary;
  } catch {
    return null;
  }
}
