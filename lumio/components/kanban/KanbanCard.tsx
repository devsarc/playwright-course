interface KanbanCardProps {
  title: string;
  done?: boolean;
  onDelete?: () => void;
}

export default function KanbanCard({ title, done, onDelete }: KanbanCardProps) {
  return (
    <div className={done ? 'line-through' : ''} data-testid="kanban-card">
      <span>{title}</span>
      {done && <span data-testid="card-completed-badge">Done</span>}
      {onDelete && (
        <button data-testid="card-delete-btn" onClick={onDelete}>
          Delete
        </button>
      )}
    </div>
  );
}
