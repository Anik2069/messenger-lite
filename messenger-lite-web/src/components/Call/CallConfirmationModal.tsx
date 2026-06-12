'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface CallConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const CallConfirmationModal = ({ isOpen, onClose, onConfirm }: CallConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 animate-scaleIn">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Already in a call
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    You are already in a call. Do you want to leave the current call and start a new one?
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Leave Call
                    </Button>
                </div>
            </div>
        </div>
    );
};
