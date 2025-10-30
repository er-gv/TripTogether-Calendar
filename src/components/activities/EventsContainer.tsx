import React from 'react';

// Generic scrollable container for any items. Allows caller to provide
// a renderItem function and an optional getDayKey function used for
// sticky labels and data-day attributes for scrolling.

export type ScrollableProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  getKey?: (item: T, index: number) => string;
  getDayKey?: (item: T) => string | undefined; // YYYY-MM-DD
  className?: string;
  stickyLabel?: string | null;
};

function EventsContainerInner<T = any>(props: ScrollableProps<T>, ref: React.Ref<HTMLDivElement>) {
  const { items, renderItem, getKey, getDayKey, className = '', stickyLabel = null } = props;

  return (
    <div ref={ref} className={`overflow-y-auto ${className}`} style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Sticky label inside the scrollable area */}
      <div className="sticky top-0 bg-white/95 z-10 py-2">
        <div className="max-w-7xl mx-auto px-2">
          <div className="text-sm font-semibold text-gray-700">{stickyLabel || ''}</div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {items.map((item, idx) => {
          const key = getKey ? getKey(item, idx) : (item as any).id ?? String(idx);
          const dayKey = getDayKey ? getDayKey(item) : undefined;
          return (
            <div key={key} {...(dayKey ? { ['data-day']: dayKey } : {})}>
              {renderItem(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const EventsContainer = React.forwardRef(EventsContainerInner) as unknown as <T = any>(
  props: ScrollableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null;

(EventsContainer as any).displayName = 'EventsContainer';

export default EventsContainer;
