import React from 'react';

export const Spinner: React.FC<{ size?: number; color?: string }> = ({
  size = 40,
  color = 'text-blue-500',
}) => {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-4 border-gray-200 ${color}`}
      style={{ width: size, height: size, borderTopColor: 'currentColor' }}
    ></div>
  );
};
