import React, { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Dynamically import Quill to avoid requiring it at build-time.
    Promise.all([
      import('quill'),
      import('quill/dist/quill.snow.css')
    ])
      .then(([QuillModule]) => {
        if (!mounted) return;
        const Quill = (QuillModule && (QuillModule.default || QuillModule)) as any;
        if (!containerRef.current) return;

        // Initialize editor
        const editor = new Quill(containerRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['blockquote', 'link'],
              ['clean']
            ]
          }
        });

        // Set initial content
        editor.root.innerHTML = value || '';

        const updateHtml = () => {
          const html = editor.root.innerHTML;
          onChange(html === '<p><br></p>' ? '' : html);
        };

        // Auto-link plain URLs typed or pasted by the user
        const autoLink = () => {
          try {
            const text = editor.getText();
            const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
            let match: RegExpExecArray | null;
            while ((match = urlRegex.exec(text)) !== null) {
              const raw = match[0];
              const start = match.index;
              const length = raw.length;
              const formats = editor.getFormat(start, length);
              if (!formats.link) {
                const href = raw.startsWith('www.') ? `http://${raw}` : raw;
                editor.formatText(start, length, 'link', href);
              }
            }
          } catch (e) {
            // ignore
          }
        };

        // Ensure all links have target=_blank and rel attributes for security
        const ensureLinkAttrs = () => {
          try {
            const anchors = containerRef.current?.querySelectorAll('a') || [];
            anchors.forEach((a) => {
              if (!(a as HTMLAnchorElement).getAttribute('target')) {
                (a as HTMLAnchorElement).setAttribute('target', '_blank');
              }
              (a as HTMLAnchorElement).setAttribute('rel', 'noopener noreferrer');
            });
          } catch (e) {
            // ignore
          }
        };

        const handler = (delta: any, oldDelta: any, source: string) => {
          if (source === 'user') {
            autoLink();
            ensureLinkAttrs();
          }
          updateHtml();
        };

        editor.on('text-change', handler);
        // Also ensure attrs initially
        ensureLinkAttrs();
        quillRef.current = { editor, handler };
        setLoaded(true);
      })
      .catch(() => {
        // If Quill is not available, stay with fallback textarea
        setLoaded(false);
      });

    return () => {
      mounted = false;
      if (quillRef.current) {
        try {
          quillRef.current.editor.off('text-change', quillRef.current.handler);
        } catch (e) {
          // ignore
        }
        quillRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep external value in sync
  useEffect(() => {
    const q = quillRef.current;
    if (q && q.editor) {
      const current = q.editor.root.innerHTML;
      if ((value || '') !== current) {
        // Preserve selection? Simpler to set contents directly
        q.editor.root.innerHTML = value || '';
      }
    }
  }, [value]);

  // Always render the container so Quill can attach to it when the dynamic import completes.
  // Show a textarea fallback on top until Quill has finished loading successfully.
  return (
    <div className="relative">
      <div ref={containerRef} />
      {!loaded && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="input resize-none"
        />
      )}
    </div>
  );
}
