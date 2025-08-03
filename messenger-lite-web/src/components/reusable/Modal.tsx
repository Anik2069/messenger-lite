"use client";

import React, { useEffect, useRef } from "react";
import { XIcon } from "lucide-react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    showCloseIcon?: boolean;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
    overflowAuto?: boolean;
}

const maxWidthClasses: Record<string, string> = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
};

export default function Modal({
    open,
    overflowAuto = false,
    onClose,
    title,
    description,
    children,
    showCloseIcon = true,
    maxWidth = "lg",
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4"
            role="dialog"
            aria-modal="true"
        >
            <div
                ref={modalRef}
                className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-lg shadow-lg focus:outline-none max-h-[90vh] flex flex-col`}
            >
                {/* Header */}
                {title && (
                    <div className="sticky top-0 z-10 flex justify-between items-center border-b px-6 py-4 bg-white rounded-t-lg">
                        <div>
                            <h2 className="text-lg font-semibold">{title}</h2>
                            <h4 className="text-[#64748B]">{description}</h4>
                        </div>
                        {showCloseIcon && (
                            <button
                                aria-label="Close"
                                className="p-2 rounded-full cursor-pointer text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                onClick={onClose}
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Scrollable Content */}
                <div
                    className={`overflow-y-auto px-6 py-4 ${overflowAuto ? "flex-grow" : ""
                        }`}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
