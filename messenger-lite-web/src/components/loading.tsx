"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  show?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ show = false, className }) => {
  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
        <p className="text-white text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
