import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/auth/SplashScreen';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { ActivityBrowser } from './components/activities/ActivityBrowser';
import { CreateActivity } from './components/activities/CreateActivity';
import { EditActivity } from './components/activities/EditActivity';
import { MembersList } from './components/members/MembersList';
import { useAuth } from './hooks/useAuth';
import { useTrip } from './hooks/useTrip';
import { useActivities } from './hooks/useActivities';
import { createTrip } from './services/firestore';
import { Loader } from 'lucide-react';

type View = 'dashboard' | 'browse' | 'members' | 'create' | 'edit';

function App() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const { currentTrip, members, loading: tripLoading } = useTrip(currentTripId, user?.id || null);
  const { activities, loading: activitiesLoading, createActivity, deleteActivity, toggleOptIn, editActivity } = useActivities(currentTripId);
  
  const [view, setView] = useState<View>('dashboard');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);

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
    const handleLogin = async (tripId: string) => {
      try {
        await signInWithGoogle();
        setCurrentTripId(tripId);
      } catch (error) {
        console.error('Login error:', error);
        alert('Failed to login. Please try again.');
      }
    };

    const handleCreateTrip = async (tripData: any) => {
      try {
        await signInWithGoogle();
        const tripId = await createTrip({
          ...tripData,
          ownerId: user!.id,
          memberIds: [user!.id],
        });
        setCurrentTripId(tripId);
        return tripId;
      } catch (error) {
        console.error('Create trip error:', error);
        throw error;
      }
    };

    return <SplashScreen onLogin={handleLogin} onCreateTrip={handleCreateTrip} />;
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

  const handleCreateActivity = async (activityData: any) => {
    try {
      await createActivity({
        ...activityData,
        tripId: currentTrip.id,
        creatorId: user.id,
        creatorName: user.displayName,
        optedInUsers: [user.id],
      });
      setView('dashboard');
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Failed to create activity. Please try again.');
    }
  };

  const handleToggleOptIn = async (activityId: string, optIn: boolean) => {
    try {
      await toggleOptIn(activityId, user.id, optIn);
    } catch (error) {
      console.error('Error toggling opt-in:', error);
      alert('Failed to update activity. Please try again.');
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
      setView('dashboard');
      setEditingActivityId(null);
    } catch (error) {
      console.error('Error saving edited activity:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleLogout = () => {
    setCurrentTripId(null);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}></div>

      {/* Header */}
      <Header
        trip={currentTrip}
        user={user}
        memberCount={members.length}
        onLogout={handleLogout}
      />

  {/* Navigation */}
  <Navigation currentView={view} onViewChange={setView} trip={currentTrip} activities={activities} />

      {/* Main Content */}
      <div className="relative">
        {view === 'dashboard' && (
          <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 pb-8">
            <div className="lg:col-span-2">
              <Dashboard
                activities={activities}
                currentUser={user}
                onToggleOptIn={handleToggleOptIn}
                onDeleteActivity={handleDeleteActivity}
                onEditActivity={handleEditActivity}
                isOwner={isOwner}
              />
            </div>
            
          </div>
        )}

        {view === 'members' && (
          <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 pb-8">
            <div className="lg:col-span-2">
           
              <MembersList
                members={members}
                ownerId={currentTrip.ownerId}
                currentUserId={user.id}
              />
            </div>
          </div>
        )}

        {view === 'browse' && (
          <ActivityBrowser
            activities={activities}
            currentUser={user}
            members={members}
            onToggleOptIn={handleToggleOptIn}
            onDeleteActivity={handleDeleteActivity}
            isOwner={isOwner}
            filterDate={filterDate}
            filterMember={filterMember}
            filterTags={filterTags}
            onFilterDateChange={setFilterDate}
            onFilterMemberChange={setFilterMember}
            onFilterTagsChange={setFilterTags}
          />
        )}

        {view === 'create' && (
          <CreateActivity
            onCreateActivity={handleCreateActivity}
            onCancel={() => setView('dashboard')}
            activeTrip={currentTrip}
          />
        )}
        {view === 'edit' && editingActivityId && (
          <EditActivity
            activity={activities.find(a => a.id === editingActivityId)!}
            onEditActivity={handleSaveEditedActivity}
            onCancel={() => { setView('dashboard'); setEditingActivityId(null); }}
            activeTrip={currentTrip}
          />
        )}
      </div>
    </div>
  );
}

export default App;