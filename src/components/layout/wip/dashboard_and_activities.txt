<section className="dashboard-section">
        {view === 'dashboard' && (
          <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 pb-8">
            <div className="lg:col-span-2">
              <ActivitiesScroller
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
      </section>
      