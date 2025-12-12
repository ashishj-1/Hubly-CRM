import React, { useEffect, useCallback, useMemo } from "react";
import "./Modal.css";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showFooter = true,
  size = "medium", // small, medium, large
}) => {
  // Disable page scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Do not render modal when closed
  if (!isOpen) return null;

  // Close modal when clicking outside the modal box
  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const modalClass = useMemo(() => `modal-container modal-${size}`, [size]);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={modalClass}>
        {/* Modal Header */}
        {title ? (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
          </div>
        ) : null}

        {/* Modal Body */}
        <div className="modal-body">{children}</div>

        {/* Modal Footer */}
        {showFooter && (
          <div className="modal-footer">
            <button className="modal-btn modal-btn-cancel" onClick={onClose}>
              {cancelText}
            </button>

            {onConfirm && (
              <button
                className="modal-btn modal-btn-confirm"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;