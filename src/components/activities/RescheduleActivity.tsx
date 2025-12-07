import React, { useState } from 'react';
import { FilePen, Image, MapPin, Calendar, Tag, Loader, Users } from 'lucide-react';
import { Button } from '../common/Button';
import { type Activity } from '@/types';
import { getTags } from '@/utils/helpers';
import { isValidUrl } from '@/utils/helpers';
import { getTripDestination } from '@/utils/helpers';
import { formatDateTime, toDateTimeLocal } from '@/utils/datetime';
import RichTextEditor from '@/components/common/RichTextEditor';
import type { Trip } from '@/types';

interface RescheduleActivityProps {
  activity: Activity;
  onEditActivity: (activityId: string, activityData: Partial<Activity>) => void | Promise<void>;
  onCancel: () => void;
  activeTrip: Trip;
}

export const RescheduleActivity: React.FC<RescheduleActivityProps> = ({
  activity,
  onEditActivity,
  onCancel,
  activeTrip,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Runtime guard: EditActivity requires a valid Trip object. TypeScript makes this
  // a required prop, but add a runtime check to catch misuse from JS consumers.
  if (!activeTrip) {
    throw new Error('EditActivity requires an activeTrip prop (Trip).');
  }
  const [formData, setFormData] = useState(() => ({
    dateTime: activity?.dateTime || '',
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep form in sync if the activity prop changes
  React.useEffect(() => {
    setFormData({
      dateTime: activity?.dateTime || toDateTimeLocal(activeTrip.startDate),
    });
  }, [activity]);

  
  const validate = () => {
    const newErrors: Record<string, string> = {};
  
    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time are required';
    }
    
    // If an active trip is provided, ensure the activity date is within trip bounds
    if (formData.dateTime && activeTrip) {
      const activityDate = new Date(formData.dateTime).getTime();
      const tripStart = new Date(activeTrip.startDate).getTime();
      const tripEnd = new Date(activeTrip.endDate).getTime();
      const tripName = activeTrip.name;

      if (activityDate > tripEnd) {
        newErrors.dateTime = `Activity date is later than the end of this trip (${new Date(tripEnd).toDateString()}).`;
      }

      if (activityDate < tripStart) {
        newErrors.dateTime = `Activity date is earlier than the start of this trip (${new Date(tripStart).toDateString()}).`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submit = async () => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        // Support async handlers that return a Promise
        await Promise.resolve(onEditActivity(activity.id, formData) as any);
      } catch (err) {
        console.error('Edit activity failed', err);
        setSubmitError((err && (err as any).message) || 'Failed to edit activity.');
      } finally {
        setSubmitting(false);
      }
    };

    submit();
  };
  const tripCaption = activeTrip.name.charAt(0).toUpperCase() + activeTrip.name.slice(1) + ' (' + new Date(activeTrip.startDate).toDateString() + ' - ' + new Date(activeTrip.endDate).toDateString() + ')';

  return (
    <div className="relative max-w-4xl mx-auto px-4 pb-8 ">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <FilePen className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl align-start font-bold text-gray-800">Reschedule Activity</h2>
            <p className="text-sm text-gray-600">Change date and time for {activity.name} </p>
          </div>
        </div>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
            <strong className="block font-medium">Error</strong>
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Date and Time */}
          <div>
            
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className={`input ${errors.dateTime ? 'border-red-500' : ''}`}
            />
            {errors.dateTime && <p className="mt-1 text-sm text-red-500">{errors.dateTime}</p>}
          </div>

          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" variant="success" icon={submitting ? Loader : FilePen} className="flex-1" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Activity'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};