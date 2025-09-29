"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils"; // Optional Tailwind merge utility

interface RightSideDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  direction?: "right" | "left" | "top" | "bottom";
}

export function RightSideDrawer({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  direction = "right",
}: RightSideDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction={direction}>
      <DrawerContent
        className={cn(
          "fixed right-0 top-0 bottom-0 w-[80%] max-w-[640px] bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700",
          className
        )}
      >
        {/* Header */}
        <DrawerHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="w-fit">
              {title && (
                <DrawerTitle className="text-gray-900 dark:text-white">
                  {title}
                </DrawerTitle>
              )}
              {description && (
                <DrawerDescription className="text-gray-600 dark:text-gray-400">
                  {description}
                </DrawerDescription>
              )}
            </div>
            <DrawerClose asChild>
              <button className="w-fit text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
                <X size={20} />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Content */}
        <div className=" overflow-y-auto scrollbar-none flex-1 text-gray-900 dark:text-gray-100">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <DrawerFooter className="border-t border-gray-200 dark:border-gray-700 p-4">
            {footer}
            <DrawerClose asChild>
              <button className="mt-2 text-sm text-gray-600 hover:underline dark:text-gray-400 dark:hover:text-white">
                Cancel
              </button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
