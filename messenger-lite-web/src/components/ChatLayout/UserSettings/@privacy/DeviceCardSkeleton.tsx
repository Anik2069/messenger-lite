"use client";

export const DeviceCardSkeleton = () => {
  return (
    <div className="relative w-full flex sm:block justify-between items-center p-3 rounded-lg shadow-sm border bg-white border-gray-100 animate-pulse">
      {/* Left: Icon + OS/Browser */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
        <div className="flex items-center w-full sm:flex-1 overflow-hidden">
          {/* Icon placeholder */}
          <div className="w-6 h-6 bg-gray-200 rounded-md" />

          <div className="ml-2 w-full">
            {/* OS + Browser */}
            <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
            {/* IP Address */}
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
        </div>

        {/* Right: Last Active + Tag + Terminate */}
        <div className="flex items-center justify-between space-y-1 sm:space-y-0 sm:space-x-3 mt-2 sm:mt-0 w-full sm:w-auto">
          <div className="flex flex-col sm:items-end">
            <div className="h-3 bg-gray-200 rounded w-28 mb-1" />
            <div className="h-4 bg-gray-200 rounded-full w-20" />
          </div>

          {/* Terminate Button */}
          <div className="hidden sm:flex bg-gray-100 w-6 h-6 rounded-full" />
        </div>
      </div>
    </div>
  );
};
