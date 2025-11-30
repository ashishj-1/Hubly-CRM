import React from "react";
import Modal from "../common/Modal";

const DeleteModal = ({ isOpen, onClose, onConfirm, memberName }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmText="Confirm"
      size="small"
    >
      {/* Delete confirmation message */}
      <p className="modal-description">this teammate will be deleted.</p>
    </Modal>
  );
};

export default DeleteModal;