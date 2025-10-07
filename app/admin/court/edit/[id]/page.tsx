import { notFound } from "next/navigation";
import EditCourt from "@/components/admin/court/edit-court";
import { Suspense } from "react";

const UpdateCourtPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const courtId = (await params).id;
  if (!courtId) return notFound();
  return (
    <div className="max-w-screen-xl px-4 py-16 mt-10 mx-auto">
      <Suspense fallback={<p>Loading...</p>} />
      <EditCourt courtId={courtId} />
    </div>
  );
};

export default UpdateCourtPage;
