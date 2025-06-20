import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

export type PopupSize = 'modal-xs' | 'modal-sm' | 'modal-md' | 'modal-lg' | 'modal-xl' | 'modal-2xl';
export type PopupPosition = 'modal-center' | 'modal-top' | 'modal-topLeft' | 'modal-tr' | 'modal-left' | 'modal-right' | 'modal-tl' | 'modal-br' | 'modal-bl';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  contentClass?: string;
  footerClass?: string;
  size?: PopupSize;
  position?: PopupPosition;
  maxWidth?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  closeOnOutsideClick?: boolean;
}

const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  children,
  title,
  footer,
  showCloseButton = true,
  className = '',
  contentClass = '',
  footerClass = '',
  size = 'modal-lg',
  position = 'modal-center',
  maxWidth,
  ariaLabelledBy,
  ariaDescribedBy,
  closeOnOutsideClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      document.body.classList.add('overflow-hidden');
      const timeout = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timeout);
    } else if (isVisible) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setIsVisible(false);
        document.body.classList.remove('overflow-hidden');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !focusable?.length) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', trap);
    first?.focus();
    return () => document.removeEventListener('keydown', trap);
  }, [isOpen]);

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;
  return (
    <div
      className={`backdrop-overlay backdrop-blur-xs bg-opacity-50 backdrop-blur-sm ${isAnimating ? 'modal-animating' : ''}`}
      onMouseDown={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      <div
        ref={modalRef}
        className={`modal ${position} ${isAnimating ? 'show' : ''}`}
        tabIndex={-1}
      >
        <div className={`modal-wrap ${size} ${position} bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full ${maxWidth ? maxWidth : ''} relative ${className}`}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="modal-header flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-4"
                  aria-label="Close"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          {/* Content */}
          <div className={`modal-content px-6 py-4 ${contentClass}`}>{children}</div>
          {/* Footer */}
          {footer && (
            <div className={`modal-footer flex justify-end gap-2 px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700 ${footerClass}`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup; 