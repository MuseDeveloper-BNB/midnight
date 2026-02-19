import { format } from 'date-fns';

type ModerationHistoryProps = {
  logs: Array<{
    id: string;
    action: string;
    targetType: string;
    targetId: string;
    createdAt: Date;
    details?: unknown;
  }>;
};

function describeAction(log: ModerationHistoryProps['logs'][number]): string {
  switch (log.action) {
    case 'PUBLISH_CONTENT': {
      const d = log.details as Record<string, unknown> | undefined;
      const type = (d?.type as string) ?? log.targetType.toLowerCase();
      const slug = (d?.slug as string) ?? log.targetId;
      return `Published ${type} "${slug}"`;
    }
    case 'UNPUBLISH_CONTENT':
      return `Unpublished ${log.targetType.toLowerCase()} ${log.targetId}`;
    case 'ARCHIVE_CONTENT':
      return `Archived ${log.targetType.toLowerCase()} ${log.targetId}`;
    case 'CHANGE_ROLE': {
      const d = log.details as Record<string, unknown> | undefined;
      const from = (d?.from as string | undefined) ?? '?';
      const to = (d?.to as string | undefined) ?? (d?.newRole as string) ?? '?';
      return `Changed user ${log.targetId} role from ${from} to ${to}`;
    }
    case 'HIDE_COMMENT':
      return `Hid comment ${log.targetId}`;
    case 'DELETE_COMMENT':
      return `Deleted comment ${log.targetId}`;
    default:
      return `${log.action} on ${log.targetType} ${log.targetId}`;
  }
}

export function ModerationHistory({ logs }: ModerationHistoryProps) {
  if (!logs.length) {
    return <p>No moderation actions recorded yet.</p>;
  }

  return (
    <ul className="admin-moderation-list">
      {logs.map((log) => (
        <li key={log.id} className="admin-moderation-item">
          <div className="admin-moderation-main">{describeAction(log)}</div>
          <div className="admin-moderation-meta">
            {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
          </div>
        </li>
      ))}
    </ul>
  );
}
