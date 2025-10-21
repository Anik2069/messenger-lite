"use client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatTime(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return "now";
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInHours < 168) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  );
}

// src/lib/uuid.ts
export function uuidv4(): string {
  const hex = () => Math.floor(Math.random() * 16).toString(16);

  return (
    `${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}-` +
    `${hex()}${hex()}${hex()}${hex()}-` +
    `4${hex()}${hex()}${hex()}-` +
    `${(8 + Math.floor(Math.random() * 4)).toString(
      16
    )}${hex()}${hex()}${hex()}-` +
    `${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`
  );
}
