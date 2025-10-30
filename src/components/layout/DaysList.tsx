import React from 'react';
import type { Trip, Activity } from '@/types';


const scrollContainerClassName = "p-2 pl-20 mr-20 w-[80%] overflow-x-auto  whitespace-nowrap box-border";
const scrollContentClassName = "inline-flex w-[calc(100%/5)]";
// use inline-flex + flex-col + gap-0 + leading-tight so the three text rows sit closer
const enabledItemStyleClassName = "inline-flex flex-col items-center gap-0 mr-6 px-2 md:px-3 py-1 font-bold text-[16px] md:text-[16px] rounded-md transform transition-transform duration-200 hover:scale-105 hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:text-yellow-300 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white leading-tight";
const disabledButtonStyleClassName = "inline-flex flex-col items-center gap-0 mr-6 px-2 md:px-3 py-1 font-bold text-[16px] md:text-[16px] rounded-md bg-gray-200 text-gray-500 cursor-not-allowed opacity-70 leading-tight";

interface DaysListProps {
  trip?: Trip | null;
  activities?: Activity[];
  onDayClick?: (iso: string) => void;
}

export const buildDayObjects = (start?: string, end?: string) => {
  if (!start || !end) return [] as { weekday: string; monthday:string, date:string, iso: string }[];
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return [] as { weekday: string; monthday:string, date:string, iso: string  }[];

  let startDate = new Date(s);
  let endDate = new Date(e);
  if (startDate.getTime() > endDate.getTime()) {
    const tmp = startDate;
    startDate = endDate;
    endDate = tmp;
  }

  const out: { weekday: string, monthday: string; date: string; iso: string }[] = [];
  const cur = new Date(startDate);
  while (cur.getTime() <= endDate.getTime()) {
    const weekday = cur.toLocaleDateString('en-US', { weekday: 'short' });
    const dd = String(cur.getDate());
    const mm = String(cur.getMonth() + 1);
    const date = String(cur.getFullYear()) ;
    
    out.push({ 
      weekday: weekday, 
      monthday: dd, 
      date: `${mm}.${date}`, 
      iso: new Date(cur).toISOString() });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};



export const DaysList: React.FC<DaysListProps> = ({ trip, activities = [], onDayClick }) => {
  const days = buildDayObjects(trip?.startDate, trip?.endDate);

  const activeDayKeys = new Set<string>();
  activities.forEach((act) => {
    if (!act.dateTime) return;
    const key = new Date(act.dateTime).toISOString().slice(0, 10);
    activeDayKeys.add(key);
  });

  return (
    
  <div className="p-3  bg-white/50">
      
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
                  
                    <div className='m-0 text-md font-extrabold'>{dayObj.weekday}</div>
                    <div className='text-3xl font-extrabold'>{dayObj.monthday}</div>
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
                      <div className='text-md font-extrabold'>{dayObj.weekday}</div>
                      <div className='text-3xl font-extrabold'>{dayObj.monthday}</div>
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


