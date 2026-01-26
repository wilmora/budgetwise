import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

/**
 * Modal component with overlay and close button
 */
export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true,
    closeOnOverlay = true,
}) {
    const modalRef = useRef(null);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'modal-sm',
        md: 'modal-md',
        lg: 'modal-lg',
        full: 'modal-full',
    };

    return (
        <div
            className="modal-overlay"
            onClick={closeOnOverlay ? onClose : undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`modal ${sizes[size]}`}
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
            >
                {(title || showClose) && (
                    <div className="modal-header">
                        {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
                        {showClose && (
                            <IconButton
                                icon={<X size={20} />}
                                onClick={onClose}
                                label="Close modal"
                                variant="ghost"
                                size="sm"
                            />
                        )}
                    </div>
                )}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * Modal footer for action buttons
 */
export function ModalFooter({ children, className = '' }) {
    return (
        <div className={`modal-footer ${className}`}>
            {children}
        </div>
    );
}

/**
 * Bottom sheet for mobile (slides up from bottom)
 */
export function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="sheet-overlay" onClick={onClose}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="sheet-handle" />
                {title && (
                    <div className="sheet-header">
                        <h3 className="sheet-title">{title}</h3>
                    </div>
                )}
                <div className="sheet-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
