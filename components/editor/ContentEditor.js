"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "image",
  "video",
  "align",
  "color",
  "background",
  "code-block",
  "code"
];

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }], // This is correct - bullet is a value, not a format
    ["blockquote", "code-block"],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["link", "image", "video"],
    ["clean"]
  ],
  clipboard: {
    matchVisual: false
  }
};

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full bg-muted animate-pulse rounded-md border flex items-center justify-center">
        <span className="text-muted-foreground">Loading editor...</span>
      </div>
    )
  }
);

export default function ContentEditor({ model, handleModelChange }) {
  return (
    <div className="content-editor h-full">
      <ReactQuill
        theme="snow"
        value={model}
        onChange={handleModelChange}
        modules={modules}
        formats={formats}
        className="h-full"
        placeholder="Write your content here..."
      />
    </div>
  );
}