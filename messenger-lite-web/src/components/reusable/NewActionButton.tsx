"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface NewActionButtonProps {
    label: string;

    avatarSrc?: string;
    onClick?: () => void;
    className?: string;
}

const NewActionButton: React.FC<NewActionButtonProps> = ({
    label,
    avatarSrc,
    onClick,
    className,
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors rounded",
                className
            )}
        >
            <div className="w-10 h-10 relative mr-3">
                {avatarSrc ? (
                    <Image
                        src={avatarSrc}
                        alt={label}
                        fill
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {label.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {label}
                </h3>
            </div>
        </div>
    );
};

export default NewActionButton;
