import React from 'react';
import type { Activity, Trip, User } from '../../types';
import ActivityCard from '../activities/ActivityCard';
import EventsContainer from '@/components/activities/EventsContainer';
import type {ScrollableProps} from '@/components/activities/EventsContainer';
import { DaysList } from '@/components/layout/DaysList';
import { CalendarPlus, Divide } from 'lucide-react';
import { exportUserItineraryToICS } from '@/utils/helpers';

//this state should be a part of eventsContainer


interface MyActivitiesProps {
    activities: Activity[];
    currentUser: User;
    trip: Trip;
    isOwner: boolean;
    onToggleOptIn: (activityId: string, optIn: boolean) => void;
    onEditActivity: (activityId: string) => void;
    onDeleteActivity: (activityId: string) => void;
};


export const MyActivities: React.FC<MyActivitiesProps> = ({
    activities,
    currentUser,
    trip,
    isOwner,
    onToggleOptIn,
    onEditActivity,
    onDeleteActivity,
}) => {

    const [selectedActivityId, setSelectedActivityId] = React.useState<string | null>(null);
    const getDayKey = (activity: Activity) => {
        // Optional: extract YYYY-MM-DD from activity.dateTime for sticky labels
        const date = new Date(activity.dateTime);
        return date.toISOString().split('T')[0];
    };

    const scrollToDay = (iso: string) => {
        const container = document.querySelector('#my-activities-section') as HTMLElement;
        if(!container) {
            console.error("No container found with id my-activities-section");
            return;
        }
    
        const targetDate = new Date(iso);
        const targetDayKey = targetDate.toISOString().slice(0, 10);
        const el = document.querySelector(`[data-day="${targetDayKey}"]`) as HTMLElement;
    
        if(!el) {
            console.error("No element found for day key:", targetDayKey);
            return;
        }
        // Get element position relative to container
        const containerRect = container.getBoundingClientRect();
        const elementRect = el.getBoundingClientRect();
        
        // Calculate scroll position within the container
        const scrollTop = container.scrollTop + (elementRect.top - containerRect.top);
        
        // Scroll the container (not the window)
        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
        
        try {
            const node = el as HTMLElement;
            node.classList.remove('flash-highlight');
            // Force reflow to restart animation
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            node.offsetWidth;
            node.classList.add('flash-highlight');
            const handle = () => {
                node.classList.remove('flash-highlight');
                node.removeEventListener('animationend', handle);
            };
            node.addEventListener('animationend', handle);
        } catch (err) {
            console.error("Error in scrollToDay animation handling:", err);
        }
    
        // Add flash highlight animation
        el.classList.remove('flash-highlight');

        el.offsetWidth; // Force reflow
        el.classList.add('flash-highlight');
    
    };

    //const scrollablePane = EventsContainer as React.FC<ScrollableProps<typeof ActivityCard>>;
    
    return (<>    
        <section id="days-scroll-container">
        <DaysList
            activities={activities}
            trip={trip}
            onDayClicked={scrollToDay}
            currentUser={currentUser}
        />
        </section>
        
        <section className="flex-1 overflow-y-auto h-[600px] bg-white/40" id="my-activities-section">
            <ul>
                {activities.filter(activity => activity.optedInUsers.includes(currentUser.id)).map((activityItem, idx) => {
                    
                    return <li key={idx} data-day={getDayKey(activityItem)} className="m-5">
                        <ActivityCard
                            activity={activityItem}
                            currentUser={currentUser}
                            onToggleOptIn={onToggleOptIn}
                            onEditActivity={onEditActivity}
                            onDeleteActivity={onDeleteActivity}
                            canEdit={true}
                            canDelete={false}
                            canExport={true}
                            isActive={false}
                            onSelect={ () =>  
                                setSelectedActivityId(activityItem.id === selectedActivityId ? null : activityItem.id) 
                            }    
                            
                        />
                    </li>
                })}
            </ul>
        </section>
    </>);
};

/*
<EventsContainer
            items={activities.filter(act => act.optedInUsers.includes(currentUser.id))}
            renderItem={(activity) => (
                <ActivityCard
                    activity={activity}
                    currentUser={currentUser}
                    onToggleOptIn={onToggleOptIn}
                    onEditActivity={onEditActivity}
                    onDeleteActivity={onDeleteActivity}
                    canEdit={true}
                    canDelete={false}
                    canExport={true}
                    isActive={false}
                    onSelect={ () =>  setSelectedActivityId(activity.id === selectedActivityId ? null : activity.id) }                       
                />
            )}
            getKey={(activity) => activity.id}
            getDayKey={(activity) => {
            // Optional: extract YYYY-MM-DD from activity.dateTime for sticky labels
            const date = new Date(activity.dateTime);
            return date.toISOString().split('T')[0];
  }}
  className="flex-1"
*/