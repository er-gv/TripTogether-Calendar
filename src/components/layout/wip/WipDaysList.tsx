import React from 'react';
import type { Trip, Activity } from '@/types';

interface WipDaysListProps {
  trip?: Trip | null;
  activities?: Activity[];
  onDayClick?: (iso: string) => void;
}

export const buildDayObjects = (start?: string, end?: string) => {
  if (!start || !end) return [] as { label: string; iso: string }[];
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return [] as { label: string; iso: string }[];

  let startDate = new Date(s);
  let endDate = new Date(e);
  if (startDate.getTime() > endDate.getTime()) {
    const tmp = startDate;
    startDate = endDate;
    endDate = tmp;
  }

  const includeYear = startDate.getFullYear() !== endDate.getFullYear();
  const out: { label: string; iso: string }[] = [];
  const cur = new Date(startDate);
  while (cur.getTime() <= endDate.getTime()) {
    const weekday = cur.toLocaleDateString('en-US', { weekday: 'short' });
    const dd = String(cur.getDate()).padStart(2, '0');
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const label = includeYear ? `${weekday}, ${dd}/${mm}/${String(cur.getFullYear())}` : `${weekday}, ${dd}/${mm}`;
    out.push({ label, iso: new Date(cur).toISOString() });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};

export const WipDaysList: React.FC<WipDaysListProps> = ({ trip, activities = [], onDayClick }) => {
  const days = buildDayObjects(trip?.startDate, trip?.endDate);

  const activeDayKeys = new Set<string>();
  activities.forEach((act) => {
    if (!act.dateTime) return;
    const key = new Date(act.dateTime).toISOString().slice(0, 10);
    activeDayKeys.add(key);
  });

  return (
    <div className="m-4 p-3 bg-green-9500 rounded-md">
      <span className="text-yellow-300 font-bold text-[18px]">list of days in the trip</span>
      {days.length > 0 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible md:gap-2">
                {days.map((dayObj, idx) => {
            const dayKey = new Date(dayObj.iso).toISOString().slice(0, 10);
            const hasEvents = activeDayKeys.has(dayKey);
            return (
              <li key={dayObj.iso + idx}>
                {hasEvents ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onDayClick) onDayClick(dayObj.iso);
                    }}
                    className={`px-2 md:px-3 py-1 font-bold text-[16px] md:text-[18px] rounded-md transition focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-orange-500 hover:bg-orange-600 text-white`}
                  >
                    {dayObj.label}
                  </button>
                ) : (
                  <span className="inline-block" title="no events scheduled for this day">
                    <button
                      type="button"
                      disabled
                      aria-disabled
                      className="px-2 md:px-3 py-1 font-bold text-[16px] md:text-[18px] rounded-md transition bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"
                    >
                      {dayObj.label}
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};


