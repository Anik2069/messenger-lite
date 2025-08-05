"use client";

import { useModal } from "@/hooks/useModal";
import React, { createContext, useContext, useState } from "react";

interface GlobalContextType {

    newDrawerOpen: () => void;
    newDrawerClose: () => void;
    newDrawerIsOpen: boolean;
    setNewDrawerIsOpen: (isOpen: boolean) => void
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { open: newDrawerOpen, close: newDrawerClose, isOpen: newDrawerIsOpen, setIsOpen: setNewDrawerIsOpen } = useModal();

    return (
        <GlobalContext.Provider value={{ newDrawerOpen, newDrawerClose, newDrawerIsOpen, setNewDrawerIsOpen }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error(
            "useGlobalContext must be used within GlobalContextProvider"
        );
    }
    return context;
};
