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
}

export function RightSideDrawer({
    isOpen,
    onOpenChange,
    title,
    description,
    children,
    footer,
    className,
}: RightSideDrawerProps) {
    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
            <DrawerContent
                className={cn(
                    "fixed right-0 top-0 bottom-0 w-[80%] max-w-[640px] bg-white shadow-xl transition-transform duration-300 ease-in-out",
                    className
                )}
                style={{ borderLeft: "1px solid #ddd" }}
            >
                <DrawerHeader className="flex justify-between items-start gap-4 p-4 border-b">
                    <div>
                        {title && <DrawerTitle>{title}</DrawerTitle>}
                        {description && (
                            <DrawerDescription>{description}</DrawerDescription>
                        )}
                    </div>
                    <DrawerClose asChild>
                        <button className="text-gray-500 hover:text-black">
                            <X size={20} />
                        </button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="p-4 overflow-y-auto flex-1">{children}</div>

                {footer && (
                    <DrawerFooter className="border-t p-4">
                        {footer}
                        <DrawerClose asChild>
                            <button className="mt-2 text-sm text-gray-600 hover:underline">
                                Cancel
                            </button>
                        </DrawerClose>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    );
}
