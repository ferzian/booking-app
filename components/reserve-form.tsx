"use client";
import { useState, useActionState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createReserve } from "@/lib/actions";
import { CourtDetailProps, DisabledDateProps } from "@/types/court";
import clsx from "clsx";

const ReserveForm = ({
  court,
  disabledDate,
}: {
  court: CourtDetailProps;
  disabledDate: DisabledDateProps[];
}) => {
  const [reserveDate, setReserveDate] = useState(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [state, formAction, isPending] = useActionState(
    createReserve.bind(
      null,
      court.id,
      court.price,
      reserveDate,
      startTime,
      endTime
    ),
    null
  );

  const excludeDates = disabledDate
    .map((item) => {
      const date = new Date(item.date);
      return {
        start: new Date(date.setHours(0, 0, 0, 0)),
        end: new Date(date.setHours(23, 59, 59, 999)),
      };
    })
    .filter((item) => item.start && item.end);

  const operatingHours = Array.from({ length: 17 }, (_, i) => {
    const hour = 8 + i;
    return `${String(hour).padStart(2, "0")}:00`;
  });

  const handleStartTimeChange = (e: any) => {
    const newStartTime = e.target.value;
    if (!newStartTime) return;

    setStartTime(newStartTime);

    // Otomatis set end time 1 jam lebih dari start time
    const [hours] = newStartTime.split(":").map(Number);
    let endHour = hours + 1;

    // Jika end time melebihi jam operasional (23:00), set ke jam terakhir yang tersedia
    if (endHour > 23) {
      endHour = 23;
    }

    setEndTime(`${String(endHour).padStart(2, "0")}:00`);
  };

  const getAvailableStartTimes = () => {
    const bookedSlots = disabledDate
      .map((item) => {
        const itemDate = new Date(item.date);
        const selectedDate = new Date(reserveDate);

        if (itemDate.toDateString() === selectedDate.toDateString()) {
          return { startTime: item.startTime, endTime: item.endTime };
        }
        return null;
      })
      .filter((slot) => slot !== null);

    return operatingHours.filter((time) => {
      const [hour, min] = time.split(":").map(Number);
      const timeInMin = hour * 60 + min;

      // Cek apakah jam ini konflik dengan booking yang sudah ada
      const hasConflict = bookedSlots.some((slot) => {
        const [bookedStartHour, bookedStartMinValue] = slot.startTime
          .split(":")
          .map(Number);
        const [bookedEndHour, bookedEndMinValue] = slot.endTime
          .split(":")
          .map(Number);
        const bookedStartMinTotal = bookedStartHour * 60 + bookedStartMinValue;
        const bookedEndMinTotal = bookedEndHour * 60 + bookedEndMinValue;

        // Jika jam mulai berada dalam range booking yang sudah ada, tidak bisa dipilih
        return (
          timeInMin >= bookedStartMinTotal && timeInMin < bookedEndMinTotal
        );
      });

      return !hasConflict;
    });
  };

  const getAvailableEndTimes = () => {
    if (!startTime) return [];

    const [startHour] = startTime.split(":").map(Number);
    const bookedSlots = disabledDate
      .map((item) => {
        const itemDate = new Date(item.date);
        const selectedDate = new Date(reserveDate);

        if (itemDate.toDateString() === selectedDate.toDateString()) {
          return { startTime: item.startTime, endTime: item.endTime };
        }
        return null;
      })
      .filter((slot) => slot !== null);

    return operatingHours.filter((time) => {
      const [endHour] = time.split(":").map(Number);

      // End time harus lebih besar dari start time (bukan sama dengan)
      if (endHour < startHour + 1) return false;

      const endTimeInMin = endHour * 60;

      // Cek apakah end time ini konflik dengan booking yang sudah ada
      const hasConflict = bookedSlots.some((slot) => {
        const [bookedStartHour, bookedStartMinValue] = slot.startTime
          .split(":")
          .map(Number);
        const [bookedEndHour, bookedEndMinValue] = slot.endTime
          .split(":")
          .map(Number);
        const bookedStartMinTotal = bookedStartHour * 60 + bookedStartMinValue;
        const bookedEndMinTotal = bookedEndHour * 60 + bookedEndMinValue;

        return (
          endTimeInMin > bookedStartMinTotal &&
          endTimeInMin <= bookedEndMinTotal
        );
      });

      return !hasConflict;
    });
  };

  return (
    <div>
      <form action={formAction}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Booking Date
          </label>
          <DatePicker
            selected={reserveDate}
            onChange={(date) => setReserveDate(date)}
            minDate={new Date()}
            excludeDateIntervals={excludeDates}
            dateFormat="dd-MM-YYYY"
            wrapperClassName="w-full"
            className="py-2 px-4 rounded-md border border-gray-300 w-full"
          />
          <div aria-live="polite" aria-atomic="true">
            <p className="text-sm text-red-500 mt-2">{state?.messageDate}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Start Time - End Time
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-2">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={handleStartTimeChange}
                className="py-2 px-4 rounded-md border border-gray-300 w-full"
              >
                <option value="">Select Start Time</option>
                {getAvailableStartTimes().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-2">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="py-2 px-4 rounded-md border border-gray-300 w-full"
              >
                <option value="">Select End Time</option>
                {getAvailableEndTimes().length > 0 ? (
                  getAvailableEndTimes().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))
                ) : (
                  <option disabled>No available time</option>
                )}
              </select>
            </div>
          </div>
          <div aria-live="polite" aria-atomic="true">
            <p className="text-sm text-red-500 mt-2">{state?.messageTime}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Your Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Full Name..."
            className="py-2 px-4 rounded-md border border-gray-300 w-full"
          />
          <div aria-live="polite" aria-atomic="true">
            <p className="text-sm text-red-500 mt-2">{state?.error?.name}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            placeholder="Phone Number..."
            className="py-2 px-4 rounded-md border border-gray-300 w-full"
          />
          <div aria-live="polite" aria-atomic="true">
            <p className="text-sm text-red-500 mt-2">{state?.error?.phone}</p>
          </div>
        </div>

        <button
          type="submit"
          className={clsx(
            "px-10 py-3 text-center font-semibold text-white w-full bg-orange-400 rounded-sm cursor-pointer hover:bg-orange-500",
            {
              "opacity-50 cursor-progress": isPending,
            }
          )}
          disabled={isPending}
        >
          {isPending ? "Loading..." : "Reserve Court"}
        </button>
      </form>
    </div>
  );
};

export default ReserveForm;
