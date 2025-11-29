import React from 'react';
import type { Activity, Trip, User } from '../../types';
import ActivityCard from '../activities/ActivityCard';
import EventsContainer from '@/components/activities/EventsContainer';
import type {ScrollableProps} from '@/components/activities/EventsContainer';
import { DaysList } from '@/components/layout/DaysList';
import { CalendarPlus } from 'lucide-react';
import { exportUserItineraryToICS } from '@/utils/helpers';

//this state should be a part of eventsContainer


interface MyActivitiesProps {
    activities: Activity[];
    currentUser: User;
    trip: Trip;
    isOwner: boolean;
    onDayClicked: (date: string) => void;
    onToggleOptIn: (activityId: string, optIn: boolean) => void;
    onEditActivity: (activityId: string) => void;
    onDeleteActivity: (activityId: string) => void;
};


export const MyActivities: React.FC<MyActivitiesProps> = ({
    activities,
    currentUser,
    trip,
    isOwner,
    onDayClicked,
    onToggleOptIn,
    onEditActivity,
    onDeleteActivity,
}) => {

    const [selectedActivityId, setSelectedActivityId] = React.useState<string | null>(null);
    //const scrollablePane = EventsContainer as React.FC<ScrollableProps<typeof ActivityCard>>;
    return (<>    
        <DaysList
            activities={activities}
            trip={trip}
            onDayClicked={onDayClicked}
            currentUser={currentUser}
        />
        <div className="flex items-center gap-4  rounded-lg transition p-4 shadow-md">
            
            <button className="flex items-center hover:bg-blue-50 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-emerald-600 px-3 py-2 rounded"
                onClick={() => exportUserItineraryToICS(currentUser.id, currentUser.displayName)}>
                <CalendarPlus size={36} className="mr-2" /> 
                <h2 className='text-left text-2xl text-bold'>Export Your planned itinerary to calendar</h2>
            </button>
        </div>
        

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
/>

    
    
    </>);
};