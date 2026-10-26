import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrips } from '../store/slices/tripSlice';
import TripCard from '../components/trips/TripCard';
import CreateTripModal from '../components/trips/CreateTripModal';
import { 
  Plus, 
  Search, 
  MapPin, 
  Compass, 
  Calendar, 
  DollarSign,
  Sparkles
} from 'lucide-react';

export default function DashboardPage({ isCreateModalOpen, setIsCreateModalOpen }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { trips, loading } = useSelector((state) => state.trips);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'owned' | 'shared'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  const currentUserId = user?._id;

  const filteredTrips = trips.filter((trip) => {
    const isOwner = trip.ownerId && (trip.ownerId._id ? trip.ownerId._id === currentUserId : trip.ownerId === currentUserId);
    
    if (activeTab === 'owned' && !isOwner) return false;
    if (activeTab === 'shared' && isOwner) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = trip.title?.toLowerCase().includes(term);
      const matchDest = trip.destination?.toLowerCase().includes(term);
      if (!matchTitle && !matchDest) return false;
    }

    return true;
  });

  const totalTripsCount = trips.length;
  const totalBudgetSum = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
  const uniqueDestinations = new Set(trips.map((t) => t.destination)).size;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Aesthetic Cool Light Hero Banner */}
      <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-sky-50/90 via-indigo-50/80 to-purple-50/60 border border-indigo-100/90 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-200/80 shadow-xs">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Trip Itinerary Hub</span>
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Plan and view your day-by-day itineraries, manage activity costs, collaborate with friends, and see your stops on the map.
            </p>
          </div>

          <button
            id="dashboard-plan-trip-btn"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
            className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-white" />
            <span className="text-white">Plan New Trip</span>
          </button>
        </div>

        {/* Aesthetic Cool Light Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-indigo-100/80">
          <div className="p-3.5 rounded-xl bg-white/80 border border-sky-100 shadow-xs">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              <span>Total Trips</span>
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{totalTripsCount}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-indigo-100 shadow-xs">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>Destinations</span>
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{uniqueDestinations}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-100 shadow-xs">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>Total Budget</span>
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-800">
              ${totalBudgetSum.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-medium max-w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Trips ({trips.length})
          </button>
          <button
            onClick={() => setActiveTab('owned')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'owned'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            My Trips
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'shared'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Shared With Me
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by city or title..."
            className="w-full pl-8 pr-3.5 py-1.5 input-aesthetic text-xs"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && trips.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-xs text-slate-500">Loading trips...</p>
        </div>
      )}

      {/* Trips Grid */}
      {!loading && filteredTrips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map((trip) => (
            <TripCard key={trip._id} trip={trip} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTrips.length === 0 && (
        <div className="card-aesthetic p-10 text-center space-y-3 bg-white/80">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-800">No trips found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm
                ? `No trips matching "${searchTerm}". Try another keyword or clear the search.`
                : activeTab === 'shared'
                ? "You don't have any shared trips yet. When friends invite you, they'll show up here."
                : "Create your first trip to get started with an organized itinerary."}
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span className="text-white">Create Trip</span>
          </button>
        </div>
      )}

      {/* Create Modal */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
