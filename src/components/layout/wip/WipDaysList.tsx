import React from 'react';
import type { Trip, Activity } from '@/types';


const scrollContainerClassName = "p-2 ml-20 mr-20 w-[80%] overflow-x-auto whitespace-nowrap box-border";
const scrollContentClassName = "inline-flex";
const enabledItemStyleClassName = "inline-block mr-6 px-2 md:px-3 py-1 font-bold text-[16px] md:text-[16px] rounded-md transform transition-transform duration-200 hover:scale-105 hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:text-yellow-300 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white`";
const disabledButtonStyleClassName = "inline-block mr-6 px-2 md:px-3 py-1 font-bold text-[16px] md:text-[16px] rounded-md bg-gray-200 text-gray-500 cursor-not-allowed opacity-70";

interface WipDaysListProps {
  trip?: Trip | null;
  activities?: Activity[];
  onDayClick?: (iso: string) => void;
}

export const buildDayObjects = (start?: string, end?: string) => {
  if (!start || !end) return [] as { date: string; weekday: string; iso: string }[];
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return [] as { date: string; weekday: string; iso: string }[];

  let startDate = new Date(s);
  let endDate = new Date(e);
  if (startDate.getTime() > endDate.getTime()) {
    const tmp = startDate;
    startDate = endDate;
    endDate = tmp;
  }

  
  const out: { weekday: string, date: string; iso: string }[] = [];
  const cur = new Date(startDate);
  while (cur.getTime() <= endDate.getTime()) {
    const weekday = cur.toLocaleDateString('en-US', { weekday: 'short' });
    const dd = String(cur.getDate()).padStart(2, '0');
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const date = `${dd}/${mm}/${String(cur.getFullYear())}` ;
    out.push({ weekday: weekday, date: date, iso: new Date(cur).toISOString() });
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
  <div className="p-3  bg-green-400/50 rounded-md ">
      <div className="pb-2 text-zinc-50 font-bold text-2xl md:text-3xl text-center">list of days in the trip</div>
      <div className={scrollContainerClassName}>
        
          {days.length > 0 && (
          <ul className={scrollContentClassName}>
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
                    className={enabledItemStyleClassName} >
                  
                    <div className='text-4xl font-extrabold'>{dayObj.weekday}</div>
                    <div className='text-md font-extrabold'>{dayObj.date}</div>

                  </button>
                ) : (
                  
                  <span className="inline-block" title="no events scheduled for this day">
                    <button
                      type="button"
                      disabled
                      aria-disabled
                      className= {disabledButtonStyleClassName} 
                      /*"mr-6 px-2 md:px-3 py-1 font-bold text-[16px] md:text-[18px] rounded-md bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"*/
                    >
                      <div className='text-4xl font-extrabold'>{dayObj.weekday}</div>
                      <div className='text-md font-extrabold'>{dayObj.date}</div>
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        )}
        
      </div>
    </div>
  );
};


