'use client';

import { Laptop, Smartphone, Tablet, Bot, Server, X } from 'lucide-react';

interface DeviceCardProps {
  id: string;
  ip_address: string;
  os: string;
  browser: string;
  device_type: string;
  last_active: string;
  isCurrent?: boolean; // current session
  onTerminate?: (id: string) => void;
}

const DeviceIcon = ({ type }: { type: DeviceCardProps['device_type'] }) => {
  const commonClass = 'w-6 h-6';
  switch (type) {
    case 'DESKTOP':
      return <Laptop className={`${commonClass} text-blue-500`} />;
    case 'MOBILE':
      return <Smartphone className={`${commonClass} text-green-500`} />;
    case 'TABLET':
      return <Tablet className={`${commonClass} text-purple-500`} />;
    case 'BOT':
    case 'POSTMAN':
      return <Bot className={`${commonClass} text-gray-500`} />;
    default:
      return <Server className={`${commonClass} text-yellow-500`} />;
  }
};

export const DeviceCard = ({
  id,
  ip_address,
  os,
  browser,
  device_type,
  last_active,
  isCurrent = false,
  onTerminate,
}: DeviceCardProps) => {
  return (
    <div
      className={`relative w-full flex sm:block justify-between items-center  p-3 rounded-lg shadow-sm border text-sm transition-shadow duration-200
        ${
          isCurrent
            ? 'bg-blue-50 border-blue-200 hover:shadow-md'
            : 'bg-white border-gray-100 hover:shadow-md'
        }`}
    >
      {/* Left: Icon + OS/Browser */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center w-full sm:flex-1 overflow-hidden">
          <DeviceIcon type={device_type} />
          <div className="ml-2 truncate">
            <p className="font-medium text-gray-800 truncate text-sm sm:text-base">
              {os} • {browser}
            </p>
            <p className="text-gray-500 truncate text-xs ">{ip_address}</p>
          </div>
        </div>

        {/* Right: Last Active + Device Type + Terminate */}
        <div className="flex items-center justify-between space-y-1 sm:space-y-0 sm:space-x-3 mt-2 sm:mt-0 w-full sm:w-auto">
          <div className="flex flex-col sm:items-end">
            <span className="text-gray-400 text-xs ">{new Date(last_active).toLocaleString()}</span>
            <span
              className={`mt-1 w-fit px-2 py-0.5 rounded-full text-xs  font-medium
              ${isCurrent ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}
            >
              {isCurrent ? 'Current Session' : os}
            </span>
          </div>

          {/* Terminate Button */}
          {!isCurrent && onTerminate && (
            <button
              type="button"
              onClick={() => onTerminate(id)}
              className="hidden sm:flex cursor-pointer  items-center justify-center bg-red-50 text-red-600 p-0.5 rounded-full text-xs  transition hover:bg-red-100"
              title="Terminate Session"
            >
              <X className="w-3.5 h-3.5 hover:w-4 hover:h-4 transition-all duration-300" />
            </button>
          )}
        </div>
      </div>
      {!isCurrent && onTerminate && (
        <button
          type="button"
          onClick={() => onTerminate(id)}
          className="sm:hidden flex cursor-pointer  items-center justify-center bg-red-50 text-red-600 p-0.5 rounded-full text-xs  transition hover:bg-red-100"
          title="Terminate Session"
        >
          <X className="w-3.5 h-3.5 hover:w-4 hover:h-4 transition-all duration-300" />
        </button>
      )}
    </div>
  );
};
