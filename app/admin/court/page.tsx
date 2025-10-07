import CourtTable from "@/components/admin/court/court-table";
import Link from "next/link";
import { Suspense } from "react";

const CourtPage = () => {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-16 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Court List</h1>
        <Link
          href="/admin/court/create"
          className="bg-orange-400 px-6 py-2.5 hover:bg-orange-500 text-white font-bold"
        >
          Create New
        </Link>
      </div>
      <Suspense fallback={<p>Loading Data...</p>}>
        <CourtTable />
      </Suspense>
    </div>
  );
};

export default CourtPage;
