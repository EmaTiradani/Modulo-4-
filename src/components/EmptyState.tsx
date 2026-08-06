interface EmptyStateProps {
  titulo: string;
  descripcion: string;
}

/**
 * Estado vacío ilustrativo mostrado cuando la lista de tareas o hábitos
 * no tiene elementos todavía (FR-028), en lugar de una lista en blanco.
 */
export function EmptyState({ titulo, descripcion }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state-titulo">{titulo}</p>
      <p className="empty-state-descripcion">{descripcion}</p>
    </div>
  );
}
