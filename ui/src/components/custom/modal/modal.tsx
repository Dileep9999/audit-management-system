import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import { X } from "lucide-react";

// ModalHeader Component
interface ModalHeaderProps {
  title?: string;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = memo(({ title, onClose }) => {
  return (
    <div className="modal-header">
      <h6>{title}</h6>
      <button onClick={onClose} className="link link-red">
        <X className="size-5" />
      </button>
    </div>
  );
});

ModalHeader.displayName = "ModalHeader";

// ModalContent Component
interface ModalContentProps {
  children?: React.ReactNode;
  contentClass?: string;
}

const ModalContent: React.FC<ModalContentProps> = memo(
  ({ children, contentClass }) => {
    return <div className={`modal-content ${contentClass}`}>{children}</div>;
  },
);

ModalContent.displayName = "ModalContent";

// ModalFooter Component
interface ModalFooterProps {
  children?: React.ReactNode;
  footerClass?: string;
  isFooter?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = memo(
  ({ children, footerClass, isFooter }) => {
    return (
      <div
        className={`${isFooter ? " " : "modal-footer"} ${footerClass && footerClass}`}
      >
        {children}
      </div>
    );
  },
);

ModalFooter.displayName = "ModalFooter";

// Main Modal Component
interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?:
    | "modal-center"
    | "modal-top"
    | "modal-topLeft"
    | "modal-tr"
    | "modal-left"
    | "modal-right"
    | "modal-tl"
    | "modal-tr"
    | "modal-br"
    | "modal-bl";
  size?:
    | "modal-xs"
    | "modal-sm"
    | "modal-md"
    | "modal-lg"
    | "modal-xl"
    | "modal-2xl";
  title?: string;
  content?: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  footer?: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  id?: string;
  contentClass?: string;
  footerClass?: string;
  isFooter?: string;
}

const Modal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  position = "modal-center",
  size = "md",
  title,
  content,
  footer,
  id,
  contentClass,
  footerClass,
  isFooter,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle overlay click to close the modal
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeWithAnimation();
    }
  }, []);

  // Close modal with animation
  const closeWithAnimation = useCallback(() => {
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      setIsVisible(false);
      onClose();
      document.body.classList.remove("overflow-hidden");
    }, 300);
  }, [onClose]);

  // Handle modal open/close state
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      document.body.classList.add("overflow-hidden");

      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Don't render if the modal is not visible
  if (!isVisible) return null;

  return (
    <>
      <div>
        {/* Backdrop overlay */}
        <div
          className={`backdrop-overlay backdrop-blur-xs ${isAnimating ? "show" : ""}`}
          onClick={closeWithAnimation}
        />
        {/* Modal container */}
        <div
          className={`modal ${position} ${isAnimating ? "show" : ""}`}
          onClick={handleOverlayClick}
          id={id}
        >
          <div className={`modal-wrap ${size} ${position}`} ref={modalRef}>
            {/* Modal header */}
            {title && (
              <ModalHeader title={title} onClose={closeWithAnimation} />
            )}
            {/* Modal content */}
            <ModalContent contentClass={contentClass}>
              {typeof content === "function"
                ? content(closeWithAnimation)
                : content}
            </ModalContent>
            {/* Modal footer */}
            {footer && (
              <ModalFooter footerClass={footerClass} isFooter={isFooter}>
                {typeof footer === "function"
                  ? footer(closeWithAnimation)
                  : footer}
              </ModalFooter>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export { ModalHeader, ModalContent, ModalFooter, Modal };
