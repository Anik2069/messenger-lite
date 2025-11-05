"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import useDebounce from "@/hooks/useDebounce";

export interface ReusableSearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  iconClassName?: string;
  onDebouncedChange?: (value: string) => void;
  debounceDelay?: number;
  clearValue?: boolean;
}

const ReusableSearchInput = React.forwardRef<
  HTMLInputElement,
  ReusableSearchInputProps
>(
  (
    {
      placeholder = "Search...",
      containerClassName,
      iconClassName,
      className,
      onDebouncedChange,
      debounceDelay = 300,
      clearValue,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState("");
    const debouncedValue = useDebounce(value, debounceDelay);

    useEffect(() => {
      if (onDebouncedChange) {
        onDebouncedChange(debouncedValue);
      }
    }, [debouncedValue, onDebouncedChange]);

    useEffect(() => {
      setValue("");
    }, [clearValue]);

    return (
      <div className={cn("relative w-full", containerClassName)}>
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none",
            iconClassName
          )}
        />
        <Input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn("pl-9", className)}
          {...props}
        />
      </div>
    );
  }
);

ReusableSearchInput.displayName = "ReusableSearchInput";
export default ReusableSearchInput;
