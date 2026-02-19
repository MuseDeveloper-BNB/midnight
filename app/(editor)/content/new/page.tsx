import { redirect } from 'next/navigation';
import { createContentAction } from '@/actions/content/create.action';
import { ContentEditor } from '@/components/content/ContentEditor';

async function createContentFormAction(formData: FormData): Promise<void> {
  'use server';
  const result = await createContentAction(formData);
  if (result.success) {
    redirect('/editor-dashboard?created=true');
  }
  // If error, redirect with error message
  redirect(`/content/new?error=${encodeURIComponent(result.error || 'Failed to create content')}`);
}

export default function NewContentPage() {
  return (
    <section>
      <h1>New Content</h1>
      <ContentEditor onSubmit={createContentFormAction} />
    </section>
  );
}
