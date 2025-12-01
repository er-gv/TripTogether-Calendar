import React from 'react';
import type { Trip, Activity, User } from '@/types';
import { exportUserItineraryToICS } from '@/utils/helpers';
import { CalendarPlus,  Triangle } from 'lucide-react';
//import { Link, DirectLink, Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'


// use inline-flex + flex-col + gap-0 + leading-tight so the three text rows sit closer
const enabledItemStyleClassName = "inline-flex flex-col items-center gap-0 mr-2 px-2 md:px-3 py-1 font-bold text-[16px] md:text-[16px] rounded-md border-[3px] border-black transform transition-transform duration-200 hover:scale-105 hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:text-yellow-300 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white leading-tight";
const disabledButtonStyleClassName = "inline-flex flex-col items-center gap-0 mr-2 px-2 md:px-3 py-1 font-bold text-[16px] md:text-[16px] rounded-md border-[3px] border-black bg-gray-200 text-gray-500 cursor-not-allowed opacity-70 leading-tight";

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


export const DaysList: React.FC<DaysListProps>  =({ trip, activities = [], currentUser, onDayClicked }) => {
  const days = buildDayObjects(trip?.startDate, trip?.endDate);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const activeDayKeys = new Set<string>();
  activities.forEach((act) => {
    if (!act.dateTime || !currentUser || !act.optedInUsers.find(id => id === currentUser.id)) return;
    const key = new Date(act.dateTime).toISOString().slice(0, 10);
    activeDayKeys.add(key);
  });

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    const container = document.querySelector('#days-scroll-container');
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container as HTMLElement;
      console.log('Scroll check:', { scrollLeft, scrollWidth, clientWidth, canScroll: scrollWidth > clientWidth });
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
    else{
      console.error("No container found with id days-scroll-container");
    }
  };

  // Check scroll position on mount and when container changes
  React.useEffect(() => {
    // Use setTimeout to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      checkScrollPosition();
    }, 100);
    
    const container = document.querySelector('#days-scroll-container');
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      // Also check on resize
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        clearTimeout(timer);
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
    return () => clearTimeout(timer);
  }, [days.length]);
  
  return (
    
  <div className="p-3 bg-white/50">
      
          {days.length > 0 && currentUser && (
          
          <div className="flex flex-col gap-4">
            {/* Top row: Days list with scroll buttons */}
            <div className="flex items-stretch gap-4">
              <button id="scroll-left-button"
                  className="bg-blue-200 hover:bg-blue-100 px-3 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  
                  onClick = {() => {
                    console.log("Scrolling left");
                    const container = document.querySelector('#days-scroll-container') as HTMLElement;
                    if (container) {
                      const ul = container.querySelector('ul');
                      console.log("Before scroll:", { 
                        scrollLeft: container.scrollLeft, 
                        scrollWidth: container.scrollWidth, 
                        clientWidth: container.clientWidth,
                        ulWidth: ul?.offsetWidth,
                        containerWidth: container.offsetWidth,
                        numDays: ul?.children.length
                      });
                      container.scrollBy({ left: -100, behavior: 'smooth' });
                      setTimeout(() => {
                        console.log("After scroll:", { scrollLeft: container.scrollLeft });
                      }, 500);
                    } else {
                      console.error("Container not found");
                    }
                  }}>
                  <Triangle size={32} className="scale-y-200 -rotate-90" stroke={!canScrollLeft ? "black" : "none"} fill={canScrollLeft ? "green" : "green"} />
                </button>
              <div className="overflow-x-auto whitespace-nowrap flex-1 min-w-0"
              id="days-scroll-container">
                
                <ul className="flex flex-nowrap gap-2 w-max">
                  {days.map((dayObj, idx) => {
                    const dayKey = new Date(dayObj.iso).toISOString().slice(0, 10);
                    const hasEvents = activeDayKeys.has(dayKey);
                    return (
                      <li key={dayObj.iso + idx}>
                        {hasEvents ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onDayClicked) {
                                onDayClicked(dayObj.iso);
                              }
                            }}
                            className={enabledItemStyleClassName}>
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
                              className={disabledButtonStyleClassName}>
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
                
                
              </div>
              <button 
                  className="bg-blue-200 hover:bg-blue-100 px-3 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  
                  onClick = {() => {
                    const container = document.querySelector('#days-scroll-container');
                    if(!container) {
                      console.error("No container found with id days-scroll-container");
                      return;
                    }
                    else{
                      console.log("Container scrollWidth:", (container as HTMLElement).scrollWidth, " clientWidth:", (container as HTMLElement).clientWidth, " scrollLeft:", (container as HTMLElement).scrollLeft);
                    }
                    container.scrollBy({ left: +100, behavior: 'smooth' });
                  }}>
                  < Triangle size={32} className="scale-y-200 rotate-90" stroke={!canScrollRight ? "none" : "none"} fill={canScrollRight ? "green" : "green"} />
                </button>
            </div>

            {/* Bottom row: Export button */}
            <div className="flex justify-start bg-blue-200 hover:bg-blue-100 text-emerald-600">
              <a href="#" className="flex items-center  px-4 py-3 rounded"
                  onClick={() => exportUserItineraryToICS(currentUser.id, currentUser.displayName)}>
                  <CalendarPlus size={20} className="mr-2" /> 
                  <h2 className='text-left text-lg font-bold'>
                    Export itinerary to calendar
                  </h2>
              </a>
            </div>
          </div>
          )}
        
      
    </div>
  );
};


