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
  addFriendModalOpen: () => void;
  addFriendModalClose: () => void;
  isAddFriendModalOpen: boolean;
  setIsAddFriendModalOpen: (isOpen: boolean) => void;

  generalSettingModalOpen: () => void;
  generalSettingModalClose: () => void;
  isGeneralSettingModalOpen: boolean;
  setIsGeneralSettingModalOpen: (isOpen: boolean) => void;

  privacySettingModalOpen: () => void;
  privacySettingModalClose: () => void;
  isPrivacySettingModalOpen: boolean;
  setIsPrivacySettingModalOpen: (isOpen: boolean) => void;

  removeModalOpen: () => void;
  removeModalClose: () => void;
  removeModalIsOpen: boolean;
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
  const {
    open: addFriendModalOpen,
    close: addFriendModalClose,
    isOpen: isAddFriendModalOpen,
    setIsOpen: setIsAddFriendModalOpen,
  } = useModal();
  const {
    open: generalSettingModalOpen,
    close: generalSettingModalClose,
    isOpen: isGeneralSettingModalOpen,
    setIsOpen: setIsGeneralSettingModalOpen,
  } = useModal();
  const {
    open: privacySettingModalOpen,
    close: privacySettingModalClose,
    isOpen: isPrivacySettingModalOpen,
    setIsOpen: setIsPrivacySettingModalOpen,
  } = useModal();

  const {
    open: removeModalOpen,
    close: removeModalClose,
    isOpen: removeModalIsOpen,
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

        addFriendModalOpen,
        addFriendModalClose,
        isAddFriendModalOpen,
        setIsAddFriendModalOpen,

        generalSettingModalOpen,
        generalSettingModalClose,
        isGeneralSettingModalOpen,
        setIsGeneralSettingModalOpen,

        privacySettingModalOpen,
        privacySettingModalClose,
        isPrivacySettingModalOpen,
        setIsPrivacySettingModalOpen,

        removeModalOpen,
        removeModalClose,
        removeModalIsOpen,
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
