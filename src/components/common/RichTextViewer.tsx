import React, { useEffect, useState } from 'react';

type Props = { html?: string | null; className?: string };

export default function RichTextViewer({ html, className }: Props) {
  const [sanitized, setSanitized] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    if (!html) {
      setSanitized('');
      return;
    }
    // Dynamically import DOMPurify to avoid adding it as a build-time hard dependency
    import('dompurify').then((mod) => {
      if (!mounted) return;
      const DOMPurify = (mod.default || mod);
      // Allow link attributes so we can keep target and rel when sanitizing
      const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'iframe'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'src', 'allow', 'allowfullscreen', 'frameborder'],
      });

      // Ensure anchors open in a new tab and have a visible blue color
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(clean, 'text/html');
        const anchors = doc.querySelectorAll('a');
        anchors.forEach((a) => {
          if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          // If no explicit color/style, add inline blue color for visibility
          const existingStyle = a.getAttribute('style') || '';
          if (!/color\s*:\s*/i.test(existingStyle)) {
            a.setAttribute('style', `${existingStyle}color: #2563eb; text-decoration: underline;`);
          }
        });
        // Validate iframes: only allow common providers (youtube, vimeo) or https origins
        const iframes = doc.querySelectorAll('iframe');
        iframes.forEach((f) => {
          const src = f.getAttribute('src') || '';
          const isAllowed = /^(https?:)?\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be|player\.vimeo\.com)\//i.test(src) || /^https:/i.test(src);
          if (!isAllowed) {
            // remove unsafe iframe
            f.remove();
            return;
          }
          if (!f.getAttribute('allow')) {
            f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
          }
          f.setAttribute('allowfullscreen', '');
          f.setAttribute('frameborder', '0');
          // ensure https src
          if (src.startsWith('//')) f.setAttribute('src', `https:${src}`);
        });
        setSanitized(doc.body.innerHTML);
      } catch (e) {
        // Fallback: if DOMParser fails, just use the cleaned string and patch anchors via regex
        let patched = clean.replace(/<a(.*?)>/gi, (match) => {
          if (/target=/i.test(match)) return match.replace(/style=("|')?/, (m) => m);
          const insert = ' target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;"';
          return match.replace(/<a/, `<a${insert}`);
        });
        setSanitized(patched);
      }
    }).catch(() => {
      // If dompurify isn't available, fall back to a very small sanitizer removing script tags
      let cleaned = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
      // Ensure links open in new tab and are blue
      cleaned = cleaned.replace(/<a(.*?)>/gi, (match) => {
        if (/target=/i.test(match)) return match;
        const insert = ' target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;"';
        return match.replace(/<a/, `<a${insert}`);
      });
      setSanitized(cleaned);
    });

    return () => { mounted = false; };
  }, [html]);

  if (!sanitized) return null;

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
