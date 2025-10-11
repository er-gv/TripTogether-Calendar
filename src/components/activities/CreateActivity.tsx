import React, { useState } from 'react';
import { Plus, Image, MapPin, Calendar, Tag, Loader } from 'lucide-react';
import { Button } from '../common/Button';
import { AVAILABLE_TAGS } from '@/types';
import { formatDateTime, isValidUrl, toDateTimeLocal } from '@/utils/helpers';
import RichTextEditor from '@/components/common/RichTextEditor';
import type { Trip } from '@/types';

interface CreateActivityProps {
  onCreateActivity: (activityData: {
    name: string;
    description: string;
    thumbnailUrl: string;
    mapsLink: string;
    dateTime: string;
    location: string;
    tags: string[];
  }) => void | Promise<void>;
  onCancel: () => void;
  activeTrip: Trip;
}

export const CreateActivity: React.FC<CreateActivityProps> = ({
  onCreateActivity,
  onCancel,
  activeTrip,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Runtime guard: CreateActivity requires a valid Trip object. TypeScript makes this
  // a required prop, but add a runtime check to catch misuse from JS consumers.
  if (!activeTrip) {
    throw new Error('CreateActivity requires an activeTrip prop (Trip).');
  }
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnailUrl: '',
    mapsLink: '',
    dateTime: toDateTimeLocal(activeTrip.startDate),
    location: '',
    tags: [] as string[],
  });

  React.useEffect(() => {
    // When opening the create form, default the datetime to the trip start date
    setFormData(prev => ({ ...prev, dateTime: toDateTimeLocal(activeTrip.startDate) }));
  }, [activeTrip.startDate]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Activity name is required';
    }

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

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.thumbnailUrl && !isValidUrl(formData.thumbnailUrl)) {
      newErrors.thumbnailUrl = 'Please enter a valid image URL';
    }

    if (formData.mapsLink && !isValidUrl(formData.mapsLink)) {
      newErrors.mapsLink = 'Please enter a valid Google Maps URL';
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
        await Promise.resolve(onCreateActivity(formData) as any);
      } catch (err) {
        console.error('Create activity failed', err);
        setSubmitError((err && (err as any).message) || 'Failed to create activity.');
      } finally {
        setSubmitting(false);
      }
    };

    submit();
  };
  const tripCaption = activeTrip.name.charAt(0).toUpperCase() + activeTrip.name.slice(1)
  + ' (' + new Date(activeTrip.startDate).toDateString() + ' - ' + new Date(activeTrip.endDate).toDateString() + ')';
  return (
    <div className="relative max-w-4xl mx-auto px-4 pb-8">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <Plus className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create New Activity</h2>
            <p className="text-sm text-gray-600">Add a new activity to trip {tripCaption}</p>
          </div>
        </div>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
            <strong className="block font-medium">Error</strong>
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., EiffelTower Visit"
              className={`input ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Describe the activity..."
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Image size={16} />
              Thumbnail Image URL
            </label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className={`input ${errors.thumbnailUrl ? 'border-red-500' : ''}`}
            />
            {errors.thumbnailUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.thumbnailUrl}</p>
            )}
            {formData.thumbnailUrl && !errors.thumbnailUrl && (
              <div className="mt-2">
                <img
                  src={formData.thumbnailUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                  onError={(e) => {
                    setErrors({ ...errors, thumbnailUrl: 'Invalid image URL' });
                  }}
                />
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Date and Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className={`input ${errors.dateTime ? 'border-red-500' : ''}`}
            />
            {errors.dateTime && <p className="mt-1 text-sm text-red-500">{errors.dateTime}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Champ de Mars, Paris"
              className={`input ${errors.location ? 'border-red-500' : ''}`}
            />
            {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
          </div>

          {/* Google Maps Link */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Google Maps Link
            </label>
            <input
              type="url"
              value={formData.mapsLink}
              onChange={(e) => setFormData({ ...formData, mapsLink: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
              className={`input ${errors.mapsLink ? 'border-red-500' : ''}`}
            />
            {errors.mapsLink && <p className="mt-1 text-sm text-red-500">{errors.mapsLink}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Paste a Google Maps link for easy navigation
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag size={16} />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    formData.tags.includes(tag)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" variant="success" icon={submitting ? Loader : Plus} className="flex-1" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Activity'}
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