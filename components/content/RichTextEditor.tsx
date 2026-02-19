'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class: 'rte-editor',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  function toggleHeading(level: 2 | 3) {
    editor?.chain().focus().toggleHeading({ level }).run();
  }

  return (
    <div className="rte-root">
      <div className="rte-toolbar" aria-label="Formatting options">
        <button
          type="button"
          className={editor.isActive('heading', { level: 2 }) ? 'rte-btn is-active' : 'rte-btn'}
          onClick={() => toggleHeading(2)}
        >
          H2
        </button>
        <button
          type="button"
          className={editor.isActive('heading', { level: 3 }) ? 'rte-btn is-active' : 'rte-btn'}
          onClick={() => toggleHeading(3)}
        >
          H3
        </button>
        <button
          type="button"
          className={editor.isActive('bold') ? 'rte-btn is-active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={editor.isActive('italic') ? 'rte-btn is-active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className={editor.isActive('bulletList') ? 'rte-btn is-active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          type="button"
          className={editor.isActive('orderedList') ? 'rte-btn is-active' : 'rte-btn'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <button
          type="button"
          className={editor.isActive('link') ? 'rte-btn is-active' : 'rte-btn'}
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href as string | null;
            // eslint-disable-next-line no-alert
            const url = window.prompt('Set link URL', previousUrl ?? '');
            if (url === null) return;
            if (url === '') {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange('link')
              .setLink({ href: url })
              .run();
          }}
        >
          Link
        </button>
      </div>

      {placeholder && !editor.getText().trim() && (
        <p className="rte-placeholder">{placeholder}</p>
      )}

      <div className="rte-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

