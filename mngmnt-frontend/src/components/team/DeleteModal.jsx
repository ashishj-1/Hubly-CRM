import React, { memo } from "react";
import Modal from "../common/Modal";

const DeleteModal = ({ isOpen, onClose, onConfirm, memberName }) => {
  const body = (
    <p className="modal-description">this teammate will be deleted.</p>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmText="Confirm"
      size="small"
    >
      {/* Delete confirmation message */}
      {body}
    </Modal>
  );
};

export default memo(DeleteModal);