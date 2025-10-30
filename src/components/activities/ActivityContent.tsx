import React from 'react';
import RichTextViewer from '@/components/common/RichTextViewer';
import ActivityTags from './ActivityTags';

interface ActivityContentProps {
  description?: string | null;
  tags?: string[];
  className?: string;
}

const ActivityContent: React.FC<ActivityContentProps> = ({ description, tags = [], className = '' }) => {
  return (
    <div className={className}>
      <div className="mb-4">
        <RichTextViewer html={description ?? ''} />
      </div>

      {tags && tags.length > 0 && (
        <div>
          <ActivityTags tags={tags} />
        </div>
      )}
    </div>
  );
};

export default ActivityContent;
