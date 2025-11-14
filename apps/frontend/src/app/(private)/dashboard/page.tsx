import { ChartLineDots } from "@/components/reuseable/chart-line-dots";
import { ChartPieLabel } from "@/components/reuseable/chart-pie-label";
import { RecentDocuments } from "@/components/reuseable/recent-documents";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 max-w-dvw">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ChartLineDots />
        <ChartLineDots />
        <ChartLineDots />
        <ChartLineDots />
      </div>
      <div className="flex flex-row gap-4 w-full">
        <ChartPieLabel />
        <RecentDocuments />
      </div>
    </div>
  );
}
