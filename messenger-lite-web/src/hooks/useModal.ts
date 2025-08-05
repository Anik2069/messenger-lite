"use client";
import { useState } from "react";

interface ModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useModal = (): ModalState => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close, setIsOpen };
};
