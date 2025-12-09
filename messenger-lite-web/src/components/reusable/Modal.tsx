'use client';

import React, { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  showCloseIcon?: boolean;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  overflowAuto?: boolean;
}

const maxWidthClasses: Record<string, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
  '6xl': 'sm:max-w-6xl',
  '7xl': 'sm:max-w-7xl',
};

export default function Modal({
  open,
  overflowAuto = false,
  onClose,
  title,
  description,
  children,
  showCloseIcon = true,
  maxWidth = 'lg',
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      const previousActiveElement = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      return () => previousActiveElement?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/40 "
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-gray-900 rounded-lg shadow-lg focus:outline-none max-h-[90vh]  overflow-auto scrollbar-none flex flex-col`}
      >
        {/* Header */}
        {title && (
          <div className="sticky top-0 z-10 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-900 rounded-t-lg">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
              {description && (
                <h4 className="text-sm text-[#64748B] dark:text-gray-400">{description}</h4>
              )}
            </div>
            {showCloseIcon && (
              <button
                aria-label="Close"
                className="p-2 rounded-full cursor-pointer text-gray-500 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900"
                onClick={onClose}
              >
                <XIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content */}
        <div
          className={`${className} px-6 py-4  ${
            overflowAuto ? 'overflow-y-auto flex-grow' : ''
          } text-gray-900 dark:text-gray-100`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
