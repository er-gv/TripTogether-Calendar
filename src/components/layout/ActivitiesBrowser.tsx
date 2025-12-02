import React from 'react';
import type { Activity, Trip, User } from '../../types';
import ActivityCard from '../activities/ActivityCard';
import { DaysList } from '@/components/layout/DaysList';

//this state should be a part of eventsContainer


interface ActivitiesBrowserProps {
    activities: Activity[];
    currentUser: User;
    trip: Trip;
    isOwner: boolean;
    onToggleOptIn: (activityId: string, optIn: boolean) => void;
    onEditActivity: (activityId: string) => void;
    onDeleteActivity: (activityId: string) => void;
    isCurrentUserOnly: boolean;    
    dateFilter: string,
    tagsFilter: string[],
    optInFilter: string[],
    creatorFilter: string,
};


export const ActivitiesBrowser: React.FC<ActivitiesBrowserProps> = ({
    activities,
    currentUser,
    trip,
    isOwner,
    isCurrentUserOnly,
    onToggleOptIn,
    onEditActivity,
    onDeleteActivity,
    dateFilter,
    tagsFilter,
    optInFilter,
    creatorFilter,
    
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

    const filteredActivities = activities.filter(activity => {
        // Filter by current user opt-in status
        if (isCurrentUserOnly && !activity.optedInUsers.includes(currentUser.id)) {
            return false;
        }
        if (dateFilter && !activity.dateTime.startsWith(dateFilter)) {
            return false;
        }
        if (tagsFilter.length > 0 && !tagsFilter.some(tag => activity.tags.includes(tag))) {
            return false;
        }
        if (optInFilter.length > 0 && !optInFilter.some(userId => activity.optedInUsers.includes(userId))) {
            return false;
        }
        if (creatorFilter && activity.creatorName !== creatorFilter) {
            return false;
        }
        return true;
    });

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
            <ul className='pt-4 pb-10'>
                {filteredActivities.map((activityItem, idx) => {
                    
                    return <li key={idx} data-day={getDayKey(activityItem)} className="m-5">
                        <ActivityCard
                            activity={activityItem}
                            currentUser={currentUser}
                            onToggleOptIn={onToggleOptIn}
                            onEditActivity={onEditActivity}
                            onDeleteActivity={onDeleteActivity}
                            canEdit={true}
                            canDelete={activityItem.creatorId === currentUser.id || isOwner}
                            canExport={activityItem.optedInUsers.includes(currentUser.id)}
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
