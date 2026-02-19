type ContentEditorProps = {
  initialValues?: {
    id?: string;
    type?: string;
    title?: string;
    body?: string;
    slug?: string;
  };
  onSubmit?: (formData: FormData) => void | Promise<void>;
};

export function ContentEditor({ initialValues, onSubmit }: ContentEditorProps) {
  return (
    <form
      action={onSubmit}
    >
      <input type="hidden" name="id" value={initialValues?.id ?? ''} />
      <label>
        Type
        <select name="type" defaultValue={initialValues?.type ?? 'NEWS'}>
          <option value="NEWS">News</option>
          <option value="BLOG">Blog</option>
        </select>
      </label>
      <label>
        Title
        <input name="title" defaultValue={initialValues?.title ?? ''} required />
      </label>
      <label>
        Slug
        <input name="slug" defaultValue={initialValues?.slug ?? ''} />
      </label>
      <label>
        Body
        <textarea name="body" defaultValue={initialValues?.body ?? ''} required />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}
