'use client';

import { ReactNode, useEffect } from  'react';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
};

export default function Modal ({ isOpen, onClose, children } : ModalProps){
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
        window.addEventListener('keydown', handleKeyDown);
    }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
            className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
            >
                <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={onClose}
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
}