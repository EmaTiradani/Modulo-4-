'use client';

interface ConfirmDialogProps {
  open: boolean;
  titulo: string;
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmación reutilizable para acciones destructivas
 * irreversibles (eliminar tarea/hábito — FR-006, FR-010).
 */
export function ConfirmDialog({
  open,
  titulo,
  mensaje,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <h2 id="confirm-dialog-title">{titulo}</h2>
        <p>{mensaje}</p>
        <div className="confirm-dialog-actions">
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} autoFocus>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
