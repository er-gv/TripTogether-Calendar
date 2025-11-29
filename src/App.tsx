import React, { useState } from 'react';
import './App.css';
import { SplashScreen } from './components/auth/SplashScreen';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { ActivitiesBrowser } from './components/layout/ActivitiesBrowser';
import { MyActivities } from './components/layout/MyActivities';
import { CreateActivity } from './components/activities/CreateActivity';
import { EditActivity } from './components/activities/EditActivity';
import { MembersList } from './components/members/MembersList';
import { useAuth } from './hooks/useAuth';
import { useTrip } from './hooks/useTrip';
import { useActivities } from './hooks/useActivities';
import { createTrip } from './services/firestore';
import { auth } from './services/firebase';
import { Loader, Navigation as NavIcon } from 'lucide-react';
import type { ViewMode, AuthMode } from './types';


function App() {
  
  const [view, setView] = useState<ViewMode>('memberActivities');
  const [authView, setAuthView] = useState<AuthMode>('splash');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterOptInMembers, setFilterOptInMembers] = useState<string[]>([]);
  const [filterCreatorMember, setFilterCreatorMember] = useState('');
  
  
  
  //state filters that govern whitch activities are shown in the ActivitiesBrowser
  //const [filterDate, setFilterDate] = useState('');
  //const [filterMember, setFilterMember] = useState('');
  //const [filterTags, setFilterTags] = useState<string[]>([]);
  //const [selectedActivityId, setSelectedActivityId] = React.useState<string | null>(null);
  

  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { currentTrip, members, loading: tripLoading } = useTrip(currentTripId, user?.id || null);
  const { activities, loading: activitiesLoading, createActivity, deleteActivity, toggleOptIn, editActivity } = useActivities(currentTripId);
  
  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-center">
          <Loader className="animate-spin text-white mx-auto mb-4" size={48} />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show splash screen if not logged in or no trip selected
  if (!user || !currentTripId) {
    const handleJoinTrip = async (tripId: string) => {
      try {
        // Ensure signed in
        if (!user) await signInWithGoogle();
        setCurrentTripId(tripId);
      } catch (error) {
        console.error('Join trip/login error:', error);
        alert('Failed to join trip. Please try again.');
      }
    };

    const handleCreateTrip = async (tripData: any) => {
      try {
        // Only prompt for Google auth if there's no signed-in user
        if (!user) await signInWithGoogle();

        // Prefer the real auth.currentUser uid (more up-to-date), fall back to hook user
        const ownerId = auth.currentUser?.uid || user?.id;
        if (!ownerId) throw new Error('Unable to determine signed-in user.');

        const tripId = await createTrip({
          ...tripData,
          ownerId,
          memberIds: [ownerId],
        });
        setCurrentTripId(tripId);
        return tripId;
      } catch (error) {
        console.error('Create trip error:', error);
        throw error;
      }
    };

  return <SplashScreen onLogin={handleJoinTrip} onCreateTrip={handleCreateTrip} currentUser={user} />;
  }

  
  // Show loading while trip data loads
  if (tripLoading || !currentTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-center">
          <Loader className="animate-spin text-white mx-auto mb-4" size={48} />
          <p className="text-white text-lg">Loading trip...</p>
        </div>
      </div>
    );
  }

  const isOwner = currentTrip.ownerId === user.id;

  const handleToggleOptIn = async (activityId: string, optIn: boolean) => {
    try {
      await toggleOptIn(activityId, user.id, optIn);
    } catch (error) {
      console.error('Error toggling opt-in:', error);
      alert('Failed to update activity. Please try again.');
    }
  };

  const handleCreateActivity = async (activityData: any) => {
    try {
      await createActivity({
        ...activityData,
        tripId: currentTrip.id,
        creatorId: user.id,
        creatorName: user.displayName,
        optedInUsers: [user.id],
      });
      setView('allActivities');
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Failed to create activity. Please try again.');
    }
  };

  

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
    }
  };

  const handleEditActivity = (activityId: string) => {
    // open edit form for the activity
    setEditingActivityId(activityId);
    setView('edit');
  };

  const handleSaveEditedActivity = async (activityId: string, data: any) => {
    try {
      await editActivity(activityId, data);
      setView('allActivities');
      setEditingActivityId(null);
    } catch (error) {
      console.error('Error saving edited activity:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleLogout = () => {
    setCurrentTripId(null);
    setAuthView('splash');
  };

  // Scroll to the first activity that falls on the given ISO day string (YYYY-MM-DDT...)
  const scrollToDay = (iso: string) => {
    console.log("scrollToDay called with iso:", iso);
    try {
      const targetDate = new Date(iso);
      const targetDayKey = targetDate.toISOString().slice(0, 10);
      console.log("targetDayKey:", targetDayKey);
      // Find the DOM element that Dashboard attaches with data-day
      const el = document.querySelector(`[data-day="${targetDayKey}"]`);

      if (el) {
        console.log("Found element:", el);  
        // Compute header/nav offset dynamically if possible
        const headerEl = document.querySelector('header');
        const navEl = document.querySelector('[data-nav]');
        console.log("headerEl:", headerEl, "navEl:", navEl);
        console.log("header height:", headerEl ? (headerEl as HTMLElement).offsetHeight : "none", "nav height:", navEl ? (navEl as HTMLElement).offsetHeight : "none");
        let offset = 120;
        if (headerEl) offset = offset - 0 + (headerEl as HTMLElement).offsetHeight;
        if (navEl) offset += (navEl as HTMLElement).offsetHeight;

        const rect = (el as HTMLElement).getBoundingClientRect();
        const top = window.scrollY + rect.top - offset;
        console.log("Scrolling to top position:", top);
        window.scrollTo({ top, behavior: 'smooth' });
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
      }
      else {
        console.log("No element found for day key:", targetDayKey);
      }
    } catch (err) {
      console.error("Error in scrollToDay:", err);
    }
  };

  const toggleActivitiesListForFilteredUser = (userName: string) => {
    //setFilterMember(userName);
    setView('memberActivities');
  };

  /**
 * style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}
 */
  return (

    <article className="w-full h-[800px] rounded-lg">
      
      {/* Fixed top bar containing Header and Navigation with shared gradient background */}
      <div className="fixed top-0 left-0 right-0 z-20 w-full backdrop-blur bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <header>
          <Header trip={currentTrip} user={user} memberCount={members.length} onLogout={handleLogout} />
        </header>
        <nav className="flex gap-6 px-4 items-center">
          <Navigation
            currentView={view}
            activities={activities}
            trip={currentTrip}
            onViewChange={setView}          
            onSetFilterMember={toggleActivitiesListForFilteredUser}
          /> 
        </nav>
      </div>
      
      {/* Main Content with top padding to account for fixed header */}
      <main className="pt-32 p-4 space-y-4">
      <div className="h-full">
  
      <section className=" w-full h-[1600px] shadow-lg"
            style={{ backgroundImage: `url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'repeat-y'
          }}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr_3fr_1fr] gap-6 max-w-7xl mx-auto px-4 pb-8">
            <div className="lg:col-start-2 lg:col-span-2">
      
      
        
        {view === 'membersList' && (
          <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 pb-8">
            <div className="lg:col-span-2">
           
              <MembersList
                members={members}
                ownerId={currentTrip.ownerId}
                currentUserId={user.id}
                onSetFilterMember={setFilterCreatorMember}

              />
            </div>
          </div>
        )}
        
        {view === 'memberActivities' && (
          
              <MyActivities
                trip={currentTrip}
                activities={activities}
                currentUser={user}
                isOwner={isOwner}
                onToggleOptIn={handleToggleOptIn}                
                onEditActivity={handleEditActivity}
                onDeleteActivity={handleDeleteActivity}
                onDayClicked={scrollToDay}
                
              />
            
        )}

        
        {/* Show all activities browser 
        {view === 'allActivities' && (
          <ActivityBrowser
            activities={activities}
            currentUser={user}
            members={members}
            onToggleOptIn={handleToggleOptIn}
            onDeleteActivity={handleDeleteActivity}
            isOwner={isOwner}
            onFilterDate={filterDate}
            onFilterMember={filterCreatorMember}
            onSetFilterOptInMembers={setFilterOptInMembers}
            filterTags={filterTags}
            onFilterDateChange={setFilterDate}
            onFilterTagsChange={setFilterTags}
          />
        )}
        */}

        {view === 'create' && (
          <CreateActivity
            onCreateActivity={handleCreateActivity}
            onCancel={() => setView('memberActivities')}
            activeTrip={currentTrip}
          />
        )}
        {view === 'edit' && editingActivityId && (
          <EditActivity
            activity={activities.find(a => a.id === editingActivityId)!}
            onEditActivity={handleSaveEditedActivity}
            onCancel={() => { setView('memberActivities'); setEditingActivityId(null); }}
            activeTrip={currentTrip}
          />
        )}
            {/* repeat sections to create scrollable content */}
                </div>
          </div>
                </section>
                </div>
          </main>
      

    </article>
  );
};

export default App;
