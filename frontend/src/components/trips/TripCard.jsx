import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteTrip } from '../../store/slices/tripSlice';
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Globe, 
  Lock, 
  DollarSign, 
  ShieldCheck,
  Trash2
} from 'lucide-react';

export default function TripCard({ trip, currentUserId }) {
  const dispatch = useDispatch();

  const isOwner = trip.ownerId && (trip.ownerId._id ? trip.ownerId._id === currentUserId : trip.ownerId === currentUserId);
  const collab = trip.collaborators?.find((c) => {
    const cid = c.userId?._id || c.userId;
    return cid === currentUserId;
  });
  const role = isOwner ? 'owner' : (collab ? collab.role : 'viewer');

  const formatDateRange = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    const sMonth = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const eMonth = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${sMonth} – ${eMonth}`;
  };

  const totalDays = trip.totalDays || (() => {
    if (!trip.startDate || !trip.endDate) return 1;
    const diffTime = Math.abs(new Date(trip.endDate) - new Date(trip.startDate));
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  })();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${trip.title}"? This cannot be undone.`)) {
      dispatch(deleteTrip(trip._id));
    }
  };

  return (
    <div className="card-aesthetic overflow-hidden flex flex-col group hover:shadow-card-hover transition-all bg-white">
      
      {/* Cover Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={trip.coverUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          {/* Role Badge */}
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-md border uppercase tracking-wider flex items-center gap-1 ${
            role === 'owner'
              ? 'bg-indigo-50/95 text-indigo-700 border-indigo-200'
              : role === 'editor'
              ? 'bg-sky-50/95 text-sky-700 border-sky-200'
              : 'bg-slate-50/95 text-slate-700 border-slate-200'
          }`}>
            <ShieldCheck className="w-3 h-3" />
            <span>{role}</span>
          </span>

          {/* Public / Private Badge */}
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-md border flex items-center gap-1 ${
            trip.isPublic
              ? 'bg-emerald-50/95 text-emerald-700 border-emerald-200'
              : 'bg-white/90 text-slate-600 border-slate-200'
          }`}>
            {trip.isPublic ? (
              <>
                <Globe className="w-3 h-3 text-emerald-600" />
                <span>Public Link</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Private</span>
              </>
            )}
          </span>
        </div>

        {/* Bottom Destination pill on photo */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate max-w-[180px]">{trip.destination}</span>
          </span>
          <span className="text-xs font-bold bg-indigo-600/90 text-white px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs">
            {totalDays} Days
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {trip.title}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
              <span>Target Budget:</span>
            </span>
            <span className="font-semibold text-slate-900">
              {trip.budget > 0 ? `${trip.currency} ${trip.budget.toLocaleString()}` : 'Not set'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          {/* Collaborator Avatars */}
          <div className="flex items-center -space-x-1.5">
            {trip.ownerId?.avatarUrl && (
              <img
                src={trip.ownerId.avatarUrl}
                alt="Owner"
                title={`Owner: ${trip.ownerId.name || 'Owner'}`}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-white border border-slate-200"
              />
            )}
            {trip.collaborators?.slice(0, 3).map((c, i) => (
              <img
                key={i}
                src={c.userId?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt="Collab"
                title={`${c.userId?.name || 'Member'} (${c.role})`}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-white border border-slate-200"
              />
            ))}
          </div>

          {/* Actions: Open and Delete */}
          <div className="flex items-center gap-1.5">
            {isOwner && (
              <button
                type="button"
                onClick={handleDelete}
                title="Delete Trip"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <Link
              to={`/trips/${trip._id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg border border-indigo-200/80 transition-all cursor-pointer"
            >
              <span>Open</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
