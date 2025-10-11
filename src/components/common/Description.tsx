import React from 'react';

type Props = {
  text?: string | null;
  className?: string;
};

const urlRegex = /((https?:\/\/|www\.)[\w\-_.~:/?#[\]@!$&'()*+,;=%]+)/gi;

export default function Description({ text, className }: Props) {
  if (!text) return null;

  const paragraphs = text.split(/\n{2,}/g);

  const renderInline = (str: string) => {
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(str)) !== null) {
      const url = match[0];
      const index = match.index;
      if (index > lastIndex) {
        nodes.push(str.substring(lastIndex, index));
      }
      let href = url;
      if (!/^https?:\/\//i.test(href)) href = 'http://' + href;
      nodes.push(
        <a key={index + href} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {url}
        </a>
      );
      lastIndex = index + url.length;
    }
    if (lastIndex < str.length) nodes.push(str.substring(lastIndex));
    return nodes.length === 0 ? str : nodes;
  };

  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-gray-600 mb-2">
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}
