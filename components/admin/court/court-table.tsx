import { getCourts } from "@/lib/data";
import Image from "next/image";
import { formatDate, formatCurrency } from "@/lib/utils";

const CourtTable = async () => {
  const courts = await getCourts();
  if (!courts?.length) return <p>No Court Found</p>;

  return (
    <div className="bg-white p-4 mt-5 shadow-sm">
      <table className="w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 w-32 text-sm font-bold text-gray-700 uppercase text-left">
              Image
            </th>
            <th className="px-6 py-3 text-sm font-bold text-gray-700 uppercase text-left">
              Court Name
            </th>
            <th className="px-6 py-3 text-sm font-bold text-gray-700 uppercase text-left">
              Price
            </th>
            <th className="px-6 py-3 text-sm font-bold text-gray-700 uppercase text-left">
              Created At
            </th>
            <th className="px-6 py-3 text-sm font-bold text-gray-700 uppercase">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {courts.map((court) => (
            <tr key={court.id} className="hover:bg-gray-100">
              <td className="px-6 py-4">
                <div className="h-20 w-32 relative">
                  <Image
                    src={court.image}
                    fill
                    sizes="20vw"
                    alt="court image"
                    className="object-cover"
                  />
                </div>
              </td>
              <td className="px-6 py-4">{court.name}</td>
              <td className="px-6 py-4">{formatCurrency(court.price)}</td>
              <td className="px-6 py-4">
                {formatDate(court.createdAt.toString())}
              </td>
              <td className="px-6 py-4 text-right"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourtTable;
