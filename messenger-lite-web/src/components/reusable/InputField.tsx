import type React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

import { clsx } from "clsx";
import { Label } from "../ui/label";

interface InputFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  iconToggle?: React.ReactNode;
  min?: string;
  max?: string;
  step?: string;
  value?: string | number;
  readOnly?: boolean;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  className = "",
  icon,
  iconToggle,
  min,
  max,
  step,
  value,
  readOnly = false,
  required = false,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Handler to disable number input scroll
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (type === "number") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-2">
      <Label required={required} htmlFor={name}>
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <span className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        {iconToggle && (
          <span className="absolute z-10 right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {iconToggle}
          </span>
        )}
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          value={readOnly ? value : undefined}
          readOnly={readOnly}
          onWheel={handleWheel}
          className={clsx(
            icon ? "pl-10" : "",
            iconToggle ? "pr-10" : "",
            className
          )}
          {...(readOnly
            ? {}
            : register(name, { valueAsNumber: type === "number" }))}
        />
      </div>
      {errors[name] && (
        <p className="text-sm text-red-500">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};
