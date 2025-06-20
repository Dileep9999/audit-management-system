import React from 'react';
import Popup from './Popup';

interface ConfirmProps {
  isOpen: boolean;
  title?: string;
  message: React.ReactNode;
  description?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmClassName?: string;
  cancelClassName?: string;
  loading?: boolean;
  disableConfirm?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

const Confirm: React.FC<ConfirmProps> = ({
  isOpen,
  title = 'Confirm',
  message,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmClassName = 'px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-700',
  cancelClassName = 'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600',
  loading = false,
  disableConfirm = false,
  ariaLabelledBy,
  ariaDescribedBy,
}) => (
  <Popup
    isOpen={isOpen}
    onClose={onCancel}
    ariaLabelledBy={ariaLabelledBy}
    ariaDescribedBy={ariaDescribedBy}
    showCloseButton={true}
  >
    <h2 className="text-lg font-bold mb-2" id={ariaLabelledBy}>{title}</h2>
    <div className="mb-2" id={ariaDescribedBy}>{message}</div>
    {description && <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">{description}</div>}
    <div className="flex justify-end space-x-2 mt-4">
      <button
        className={cancelClassName}
        onClick={onCancel}
        disabled={loading}
        type="button"
      >
        {cancelText}
      </button>
      <button
        className={confirmClassName}
        onClick={onConfirm}
        disabled={loading || disableConfirm}
        type="button"
      >
        {loading ? 'Loading...' : confirmText}
      </button>
    </div>
  </Popup>
);

export default Confirm; 