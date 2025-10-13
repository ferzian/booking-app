import Image from "next/image";
import { getReservationByUserId } from "@/lib/data";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const MyReserveList = async () => {
  const reservation = await getReservationByUserId();
  if (!reservation) return notFound();

  // Helper function to calculate duration in hours
  const calculateDurationHours = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;
    return (endTotalMin - startTotalMin) / 60;
  };

  return (
    <div>
      {reservation.map((item) => {
        const durationHours = calculateDurationHours(
          item.startTime,
          item.endTime
        );
        return (
          <div
            className="bg-white shadow pb-4 mb-4 md:pb-0 relative"
            key={item.id}
          >
            <div className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded-t-sm">
              <h1 className="text-sm font-medium text-gray-900 truncate">
                Reservation ID: #{item.id}
              </h1>
              <div className="flex gap-1 px-3 py-2 text-sm font-normal">
                <span>Status:</span>
                <span className="font-bold uppercase">
                  {item.Payment?.status}
                </span>
              </div>
            </div>
            <div className="flex flex-col mb-4 items-start bg-white rounded-sm md:flex-row md:w-full gap-4">
              <Image
                src={item.Court.image}
                width={500}
                height={300}
                className="object-cover w-full rounded-t-sm h-60 md:h-auto md:w-1/3 md:rounded-none md:rounded-s-sm"
                alt="image court"
              />
              <div className="flex-1 font-normal text-gray-700 px-6 py-4 w-full flex flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                    <span>Price</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                    <span>Booking Date</span>
                    <span>{formatDate(item.date.toISOString())}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                    <span>Start Time</span>
                    <span>{item.startTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                    <span>End Time</span>
                    <span>{item.endTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                    <span>Duration</span>
                    <span>
                      {durationHours}
                      <span className="ml-1">
                        {durationHours <= 1 ? "Hour" : "Hours"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-gray-900 pt-2 border-t border-gray-200">
                    <span>Sub Total</span>
                    <span>
                      {item.Payment && formatCurrency(item.Payment.amount)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
                  {item.Payment?.status === "unpaid" ? (
                    <Link
                      href={`/checkout/${item.id}`}
                      className="px-6 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition"
                    >
                      Pay Now
                    </Link>
                  ) : (
                    <Link
                      href={`/myreservation/${item.id}`}
                      className="px-5 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition"
                    >
                      View Detail
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default MyReserveList;
