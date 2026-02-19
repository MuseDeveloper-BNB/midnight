import { auth } from '@/lib/auth';
import { contentService } from '@/services/content/content.service';

export default async function EditorDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <p>Please log in.</p>;
  }

  const content = await contentService.getContentByAuthorId(session.user.id);

  return (
    <section>
      <h1>Editor dashboard</h1>
      <ul>
        {content.map((item) => (
          <li key={item.id}>
            {item.title} - {item.status}
          </li>
        ))}
      </ul>
    </section>
  );
}

