type CommentItemProps = {
  body: string;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
};

export function CommentItem({ body, canEdit, onEdit, onDelete, onReport }: CommentItemProps) {
  return (
    <div>
      <p>{body}</p>
      {canEdit && (
        <>
          <button type="button" onClick={onEdit}>
            Edit
          </button>
          <button type="button" onClick={onDelete}>
            Delete
          </button>
        </>
      )}
      <button type="button" onClick={onReport}>
        Report
      </button>
    </div>
  );
}
