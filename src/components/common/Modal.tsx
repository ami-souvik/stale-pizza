import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoMdClose } from 'react-icons/io';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed top-0 left-0 w-full z-1 bg-background rounded-lg shadow p-6 mb-8">
            <div
                ref={overlayRef}
                className="max-w-4xl mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="font-semibold mb-4">{title}</h2>
                <div className="overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
