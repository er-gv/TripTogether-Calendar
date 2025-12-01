import React from 'react';
import type { Trip, Activity, User } from '@/types';

//import { Link, DirectLink, Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

interface DaysListProps {
  trip?: Trip | null;
  currentUser?: User|null;
  activities: Activity[];
  onDayClicked: (iso: string) => void;
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


export const DaysList: React.FC<DaysListProps> = ({ trip, activities = [], currentUser, onDayClicked }) => {
  const days = buildDayObjects(trip?.startDate, trip?.endDate);

  const activeDayKeys = new Set<string>();
  activities.forEach((act) => {
    if (!act.dateTime || !currentUser || !act.optedInUsers.find(id => id === currentUser.id)) return;
    const key = new Date(act.dateTime).toISOString().slice(0, 10);
    activeDayKeys.add(key);
  });

  return (
  <div className='flex bg-blue-100 text-emerald-600 shadow-md rounded-lg'>
    <button className="text-left font-bold p-3 border-b-2 border-emerald-600">
      Scroll Left
    </button>
  <div className=" bg-white/50 overflow-auto whitespace-nowrap w-full p-3"
  id ="days-list-container">
      
    {days.length > 0 && currentUser && (
          
          <ul className="inline-flex gap-3 w-200">
          
            {days.map((dayObj, idx) => {
              const dayKey = new Date(dayObj.iso).toISOString().slice(0, 10);
              const hasEvents = activeDayKeys.has(dayKey);
              return (
                <li key={dayObj.iso + idx}>
                  {hasEvents ? (
                    <button type="button" className="bg-green-200 px-2 border-emerald-600 border-2 rounded-md"
                      onClick={() => {
                        if (onDayClicked) {
                          console.log("clicking day:", dayObj.iso); 
                          onDayClicked(dayObj.iso);
                        }else {
                          console.log("no onDayClicked handler");
                        }
                      }}
                    >
                      <div className='m-0 text-md font-extrabold'>{dayObj.weekday}</div>
                      <div className='text-xl font-extrabold'>{dayObj.monthday}</div>
                      <div className='text-md font-extrabold'>{dayObj.date}</div>
                    </button>
                  ) : (
                    
                    <button type="button" disabled aria-disabled
                      className="bg-red-200 px-2 border-red-600 border-2 rounded-md"
                      
                      /*"mr-6 px-2 md:px-3 py-1 font-bold text-[16px] md:text-[18px] rounded-md bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"*/
                    >
                      <div className='text-md font-extrabold'>{dayObj.weekday}</div>
                      <div className='text-xl font-extrabold'>{dayObj.monthday}</div>
                      <div className='text-md font-extrabold'>{dayObj.date}</div>
                    </button>
                  
                )}
              </li>
            );
          })}
        </ul>
        
      
      
        
    )}
    </div>
    <button className="text-left font-bold p-3 border-b-2 border-emerald-600">
      Scroll right
    </button>
    </div>  
  );
};


