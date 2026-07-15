import Modal from './Modal';
import Button from './Button';
import './ConfirmDialog.css';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} className="confirm-dialog">
      <p className="confirm-dialog-msg">{message}</p>
      <div className="confirm-dialog-actions">
        <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
