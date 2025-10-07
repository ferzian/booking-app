import { getAmenities, getCourtById } from "@/lib/data";
import EditForm from "@/components/admin/court/edit-form";
import { notFound } from "next/navigation";

const EditCourt = async ({ courtId }: { courtId: string }) => {
  const [amenities, court] = await Promise.all([
    getAmenities(),
    getCourtById(courtId),
  ]);

  if (!amenities || !court) return notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Edit a Court</h1>
      <EditForm amenities={amenities} court={court} />
    </div>
  );
};

export default EditCourt;
