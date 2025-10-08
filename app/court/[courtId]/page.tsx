import CourtDetail from "@/components/court-detail";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Court Detail",
};

const CourtDetailPage = async ({
  params,
}: {
  params: Promise<{ courtId: string }>;
}) => {
  const courtId = (await params).courtId;
  return (
    <div className="mt-16">
      <Suspense fallback={<p>Loading...</p>}>
        <CourtDetail courtId={courtId} />
      </Suspense>
    </div>
  );
};

export default CourtDetailPage;
