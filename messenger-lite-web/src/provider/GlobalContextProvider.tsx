"use client";

import { useModal } from "@/hooks/useModal";
import React, { createContext, useContext, useState } from "react";

interface GlobalContextType {
  newDrawerOpen: () => void;
  newDrawerClose: () => void;
  newDrawerIsOpen: boolean;
  setNewDrawerIsOpen: (isOpen: boolean) => void;
  settingModalOpen: () => void;
  settingModalClose: () => void;
  settingModalIsOpen: boolean;
  setSettingModalIsOpen: (isOpen: boolean) => void;
  sidebarOpen: () => void;
  sidebarClose: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    open: newDrawerOpen,
    close: newDrawerClose,
    isOpen: newDrawerIsOpen,
    setIsOpen: setNewDrawerIsOpen,
  } = useModal();
  const {
    open: settingModalOpen,
    close: settingModalClose,
    isOpen: settingModalIsOpen,
    setIsOpen: setSettingModalIsOpen,
  } = useModal();
  const {
    open: sidebarOpen,
    close: sidebarClose,
    isOpen: isSidebarOpen,
    setIsOpen: setIsSidebarOpen,
  } = useModal();

  return (
    <GlobalContext.Provider
      value={{
        newDrawerOpen,
        newDrawerClose,
        newDrawerIsOpen,
        setNewDrawerIsOpen,
        settingModalOpen,
        settingModalClose,
        settingModalIsOpen,
        setSettingModalIsOpen,

        sidebarOpen,
        sidebarClose,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
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
