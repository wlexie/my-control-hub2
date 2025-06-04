"use client";

import { useState, useEffect } from "react";
import { DateRangePicker, Range, RangeKeyDict } from "react-date-range";
import {
  //FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface DateFilterProps {
  onChange: (startDate: Date, endDate: Date) => void;
  onClear?: () => void;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  isOpen: boolean;
  onClose: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  onChange,
  onClear,
  initialStartDate,
  initialEndDate,
  isOpen,
  onClose,
}) => {
  const [selectedRange, setSelectedRange] = useState<Range>({
    startDate: initialStartDate || new Date(),
    endDate: initialEndDate || new Date(),
    key: "selection",
  });

  // Time states
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  // Initialize times when dates change
  useEffect(() => {
    if (selectedRange.startDate) {
      const hours = selectedRange.startDate
        .getHours()
        .toString()
        .padStart(2, "0");
      const minutes = selectedRange.startDate
        .getMinutes()
        .toString()
        .padStart(2, "0");
      setStartTime(`${hours}:${minutes}`);
    }
    if (selectedRange.endDate) {
      const hours = selectedRange.endDate
        .getHours()
        .toString()
        .padStart(2, "0");
      const minutes = selectedRange.endDate
        .getMinutes()
        .toString()
        .padStart(2, "0");
      setEndTime(`${hours}:${minutes}`);
    }
  }, [selectedRange]);

  const handleSelect = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    if (selection.startDate && selection.endDate) {
      setSelectedRange({
        startDate: selection.startDate,
        endDate: selection.endDate,
        key: "selection",
      });
    }
  };

  const handleApplyFilter = () => {
    if (selectedRange.startDate && selectedRange.endDate) {
      // Apply the time to the dates
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const startDate = new Date(selectedRange.startDate);
      startDate.setHours(startHours, startMinutes);

      const endDate = new Date(selectedRange.endDate);
      endDate.setHours(endHours, endMinutes);

      onChange(startDate, endDate);
    }
    onClose();
  };

  const handleClearFilter = () => {
    if (onClear) {
      onClear();
      setSelectedRange({
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      });
      setStartTime("00:00");
      setEndTime("23:59");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm ">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-2xl">
        <DateRangePicker
          ranges={[selectedRange]}
          onChange={handleSelect}
          moveRangeOnFirstSelection={false}
          rangeColors={["#3b82f6"]}
          maxDate={new Date()}
        />

        {/* Time Selection */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-500" />
            <span className="text-sm text-gray-700">Start Time:</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border rounded p-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-500" />
            <span className="text-sm text-gray-700">End Time:</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border rounded p-2"
            />
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-4 border-t border-gray-200">
          {onClear && (
            <button
              onClick={handleClearFilter}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-blue-300 rounded-md hover:bg-gray-200"
            >
              Clear Dates
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyFilter}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateFilter;
