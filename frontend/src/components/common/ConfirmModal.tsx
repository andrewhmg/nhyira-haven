interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className="bg-white rounded-3 p-4 shadow-lg"
        style={{ maxWidth: 420, width: '90%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h5 className="mb-2">{title}</h5>
        <p className="text-muted mb-4">{message}</p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`btn btn-sm btn-${variant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
