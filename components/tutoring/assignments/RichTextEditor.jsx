'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-[150px] border rounded-md bg-muted/30 animate-pulse flex items-center justify-center">
      <span className="text-sm text-muted-foreground">Loading editor...</span>
    </div>
  ),
});

const TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'code-block'],
  ['clean'],
];

/**
 * RichTextEditor - Reusable React Quill wrapper with dynamic import
 * @param {string} value - Current HTML content
 * @param {function} onChange - Callback when content changes
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Whether the editor is disabled
 * @param {string} className - Additional CSS classes
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  disabled = false,
  className = '',
}) {
  const modules = useMemo(
    () => ({
      toolbar: TOOLBAR_OPTIONS,
    }),
    []
  );

  const formats = useMemo(
    () => [
      'bold',
      'italic',
      'underline',
      'strike',
      'list',
      'bullet',
      'link',
      'code-block',
    ],
    []
  );

  return (
    <div className={`rich-text-editor ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        readOnly={disabled}
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 120px;
          font-size: 14px;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
        }
        .rich-text-editor .ql-editor {
          min-height: 100px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
