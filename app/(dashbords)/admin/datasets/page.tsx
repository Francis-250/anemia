import { getAllDoctorUploadedDatasets } from "@/actions/admin/datasets";
import { AdminDatasetsClient } from "@/components/admin-datasets-client";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function AdminDatasetsPage() {
  await requireAdminPage();

  const datasets = await getAllDoctorUploadedDatasets();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-xs text-muted-foreground mb-1">Administrative Oversight</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Uploaded Doctor Datasets & Predictions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review batch CSV datasets uploaded by doctors, inspect risk classification analytics, and audit patient predictions.
        </p>
      </div>

      <AdminDatasetsClient initialDatasets={datasets} />
    </div>
  );
}
