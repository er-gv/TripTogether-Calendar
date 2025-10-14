import React from 'react';

interface ActivityTagsProps {
  tags: string[];
  className?: string;
}

export const ActivityTags: React.FC<ActivityTagsProps> = ({ tags, className = '' }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-start gap-2 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium"
          title={tag}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export default ActivityTags;
