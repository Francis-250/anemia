import { DoctorDatasetAnalysis } from "@/components/doctor-dataset-analysis";
import { requireDoctorPage } from "@/lib/doctor-auth";

export default async function DoctorDatasetPage() {
  await requireDoctorPage();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-xs text-muted-foreground mb-1">Doctor Decision Support</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Batch CSV Dataset Prediction
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload patient dataset CSV files to perform machine learning anemia risk predictions across patient records.
        </p>
      </div>

      <DoctorDatasetAnalysis />
    </div>
  );
}
