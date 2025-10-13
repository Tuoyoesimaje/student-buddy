import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import { Markdown } from 'tiptap-markdown';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-600 p-2 flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-700 rounded-t-lg">
      <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-0.5 md:p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}
          title="Bold"
        >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>
      <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-0.5 md:p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}
          title="Italic"
        >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
      </button>
      <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-0.5 md:p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}
          title="Bullet List"
        >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
      <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-0.5 md:p-1 rounded-md hover:bg-gray-200 transition-colors duration-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-indigo-600' : 'text-gray-700'}`}
          title="Numbered List"
        >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="10" y1="6" x2="21" y2="6"></line>
          <line x1="10" y1="12" x2="21" y2="12"></line>
          <line x1="10" y1="18" x2="21" y2="18"></line>
          <path d="M4 6h1v4"></path>
          <path d="M4 10h2"></path>
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
        </svg>
      </button>
      <button
          onClick={() => {
            const url = window.prompt('Enter the URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-0.5 md:p-1 rounded-md hover:bg-gray-200 transition-colors duration-200 ${editor.isActive('link') ? 'bg-gray-200 text-indigo-600' : 'text-gray-700'}`}
          title="Add Link"
        >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </button>
      <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-0.5 md:p-1 rounded-md hover:bg-gray-200 transition-colors duration-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-indigo-600' : 'text-gray-700'} text-xs md:text-base`}
          title="Heading 1"
        >
        H1
      </button>
      <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-0.5 md:p-1 rounded-md hover:bg-gray-200 transition-colors duration-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-indigo-600' : 'text-gray-700'} text-xs md:text-base`}
          title="Heading 2"
        >
        H2
      </button>
      <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-0.5 md:p-1 rounded-md hover:bg-gray-200 transition-colors duration-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-indigo-600' : 'text-gray-700'} text-xs md:text-base`}
          title="Heading 3"
        >
        H3
      </button>
      <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-0.5 md:p-1 rounded-md hover:bg-gray-200 transition-colors duration-200 text-gray-700"
          title="Horizontal Rule"
        >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-minus"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </div>
  );
};

// Floating formatting button component
const FloatingFormatButton = ({ editor }) => {
  const [visible, setVisible] = useState(false); // popup visible
  const [focused, setFocused] = useState(false);

  // track editor focus to show/hide the floating button
  useEffect(() => {
    if (!editor) return;
    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);
    editor.on('focus', onFocus);
    editor.on('blur', onBlur);
    return () => {
      editor.off('focus', onFocus);
      editor.off('blur', onBlur);
    };
  }, [editor]);

  if (!editor) return null;

  // Determine which format is currently active for quick display
  const getActiveLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    if (editor.isActive('bulletList')) return '• List';
    if (editor.isActive('orderedList')) return '1. List';
    if (editor.isActive('bold')) return 'B';
    if (editor.isActive('italic')) return 'I';
    return 'Aa';
  };

  const handleToggle = () => setVisible(v => !v);

  const handleDoubleClick = () => {
    // Reset block/marks to paragraph/none
    editor.chain().focus().setParagraph().unsetAllMarks().run();
    setVisible(false);
  };

  return (
    <div className={`fixed right-6 bottom-20 z-50 flex flex-col items-center`}>
      {/* Round formatting button - centered and stacked above the page edit button */}
      <button
        onClick={handleToggle}
        onDoubleClick={handleDoubleClick}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full w-14 h-14 flex items-center justify-center shadow-md hover:shadow-lg transition-all text-sm font-medium p-4"
        title="Formatting (click to open, double-click to reset)"
      >
        <span className="text-gray-700 dark:text-gray-100 text-base">{getActiveLabel()}</span>
      </button>

      {/* small spacer between buttons */}
      <div className="h-3" />

      {/* Popup panel (appears above the button) */}
      {visible && (
        <div className="mb-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2">
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-md text-center ${editor.isActive('bold') ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-md text-center ${editor.isActive('italic') ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>I</button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-md text-center ${editor.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`} title="Bullet list">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-md text-center ${editor.isActive('orderedList') ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`} title="Numbered list">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
            </button>

            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-md text-center ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>H1</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-md text-center ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>H2</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded-md text-center ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>H3</button>
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={`p-2 rounded-md text-center hover:bg-gray-100 dark:hover:bg-gray-700`}>—</button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Tip: double-click the button to reset formatting</div>
        </div>
      )}
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing...', showToolbar = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: true,
      }),
      Markdown,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <>
      {showToolbar && <MenuBar editor={editor} />}

      {/* Editor wrapper - position relative so floating toolbar can be positioned inside */}
      <div className="relative rounded-b-lg">
        <EditorContent
          editor={editor}
          className="max-w-none p-4 min-h-[300px] md:min-h-[400px] focus:outline-none editor-content bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-b-lg"
          data-editor-content
        />

        {/* Floating formatting button (bottom-right inside editor). Appears when editor is focused. Click shows options; double-click resets formatting to paragraph/none. */}
        {editor && (
          <FloatingFormatButton editor={editor} />
        )}
      </div>
    </>
  );
};

export default RichTextEditor;

// Add basic styles for the editor content area
// These styles are necessary for the editor to render formatting correctly while typing
// and to potentially override default browser styles causing issues.
const style = document.createElement('style');
style.innerHTML = `
  .editor-content .ProseMirror {
    outline: none; /* Remove default focus outline */
  }

  /* Basic Heading Styles */
  .editor-content h1 {
    font-size: 2em;
    font-weight: bold;
    margin-top: 0.67em;
    margin-bottom: 0.67em;
  }

  .editor-content h2 {
    font-size: 1.5em;
    font-weight: bold;
    margin-top: 0.83em;
    margin-bottom: 0.83em;
  }

  .editor-content h3 {
    font-size: 1.17em;
    font-weight: bold;
    margin-top: 1em;
    margin-bottom: 1em;
  }

  /* Basic List Styles */
  .editor-content ul,
  .editor-content ol {
    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 1.5em;
  }

  .editor-content ul li {
    list-style-type: disc;
  }

  .editor-content ol li {
    list-style-type: decimal;
  }

  /* Basic Bold and Italic */
  .editor-content strong {
    font-weight: bold;
  }

  .editor-content em {
    font-style: italic;
  }

  /* Basic Horizontal Rule */
  .editor-content hr {
    border: none;
    border-top: 1px solid #ccc;
    margin: 1em 0;
  }

  /* Basic Paragraph */
  .editor-content p {
    margin-bottom: 1em;
  }
`;
document.head.appendChild(style);