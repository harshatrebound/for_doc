'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 border rounded-md bg-gray-50 flex items-center justify-center">Loading editor...</div>
});
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  height?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link'
];

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Enter content here...', 
  label,
  className = '',
  height = '200px'
}: RichTextEditorProps) {
  
  // Create custom handler that tracks changes
  const handleEditorChange = (content: string) => {
    // Only update if value has changed - prevents update loops
    if (content !== value) {
      onChange(content);
    }
  };
  
  return (
    <div className={`rich-text-editor-container ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <style jsx global>{`
        .rich-text-editor-container .quill {
          max-width: 100%;
          overflow-x: hidden;
        }
        .rich-text-editor-container .ql-container {
          font-size: 16px;
        }
        .rich-text-editor-container .ql-editor {
          min-height: ${height};
          max-height: 400px;
          overflow-y: auto;
        }
        .rich-text-editor-container .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }
        .rich-text-editor-container .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={handleEditorChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
} 