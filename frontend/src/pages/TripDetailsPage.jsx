import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTripById, deleteTrip } from '../store/slices/tripSlice';
import api from '../api/axios';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Share2, 
  Globe, 
  Lock, 
  Plus, 
  Clock, 
  CheckCircle,
  Copy,
  Layers,
  Map as MapIcon,
  PieChart,
  ListChecks,
  Trash2,
  ChevronUp,
  ChevronDown,
  Printer,
  X,
  Mail,
  UserPlus,
  Utensils,
  Camera,
  Car,
  Building,
  Plane,
  ShoppingBag,
  Compass
} from 'lucide-react';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default leaflet marker icon issue in production/bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const CATEGORY_ICONS = {
  sightseeing: Camera,
  food: Utensils,
  transport: Car,
  hotel: Building,
  flight: Plane,
  activity: Compass,
  shopping: ShoppingBag,
  other: MapPin
};

const CATEGORY_COLORS = {
  sightseeing: 'bg-amber-50 text-amber-800 border-amber-200',
  food: 'bg-orange-50 text-orange-800 border-orange-200',
  transport: 'bg-blue-50 text-blue-800 border-blue-200',
  hotel: 'bg-purple-50 text-purple-800 border-purple-200',
  flight: 'bg-sky-50 text-sky-800 border-sky-200',
  activity: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  shopping: 'bg-rose-50 text-rose-800 border-rose-200',
  other: 'bg-stone-50 text-stone-800 border-stone-200'
};

export default function TripDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTrip, currentTripRole, loading, error } = useSelector((state) => state.trips);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'map' | 'budget' | 'packing' | 'summary'
  const [selectedDay, setSelectedDay] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState('');
  
  // Local state for activities, packing items, and collaborators
  const [activities, setActivities] = useState([]);
  const [packingItems, setPackingItems] = useState([]);
  
  // Modals state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // New activity form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('sightseeing');
  const [newTime, setNewTime] = useState('10:00');
  const [newLocationName, setNewLocationName] = useState('');
  const [newCost, setNewCost] = useState('0');
  const [newNotes, setNewNotes] = useState('');

  // New invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // New packing item form
  const [newPackingLabel, setNewPackingLabel] = useState('');
  const [packingFilter, setPackingFilter] = useState('all'); // 'all' | 'packed' | 'unpacked'

  // Fetch trip data
  useEffect(() => {
    if (id) {
      dispatch(fetchTripById(id));
      api.get(`/trips/${id}`).then((res) => {
        if (res.data) {
          setIsPublic(res.data.data?.isPublic || false);
          setShareToken(res.data.data?.shareToken || '');
          if (res.data.activities) {
            setActivities(res.data.activities);
          }
          if (res.data.packingItems) {
            setPackingItems(res.data.packingItems);
          }
        }
      }).catch((err) => console.error(err));
    }
  }, [id, dispatch]);

  if (loading && !currentTrip) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-stone-500">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
        <p className="mt-3 text-xs">Loading trip...</p>
      </div>
    );
  }

  if (error || !currentTrip) {
    return (
      <div className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-3">
        <div className="card-natural p-6 border-rose-200">
          <h2 className="text-base font-bold text-stone-800">Trip Not Found</h2>
          <p className="text-xs text-stone-500 mt-1">{error || 'This trip does not exist or you do not have permission to view it.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-indigo-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate duration in days
  const totalDays = currentTrip.totalDays || (() => {
    if (!currentTrip.startDate || !currentTrip.endDate) return 1;
    const diff = Math.ceil(Math.abs(new Date(currentTrip.endDate) - new Date(currentTrip.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  })();

  const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Activities for selected day
  const dayActivities = activities
    .filter((a) => a.dayNumber === selectedDay)
    .sort((a, b) => a.order - b.order);

  // Share handlers
  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/shared/${currentTrip.shareToken || shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePublic = async () => {
    try {
      const res = await api.patch(`/trips/${currentTrip._id}/share`, {
        isPublic: !isPublic
      });
      if (res.data?.success) {
        setIsPublic(res.data.data.isPublic);
        setShareToken(res.data.data.shareToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTrip = async () => {
    if (window.confirm(`Are you sure you want to delete "${currentTrip.title}"? All scheduled activities and packing items will be permanently removed.`)) {
      await dispatch(deleteTrip(currentTrip._id));
      navigate('/');
    }
  };

  // Activity Handlers
  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    // Approximate destination coordinate center for map marker fallback
    const destCoords = {
      tokyo: { lat: 35.6762, lng: 139.6503 },
      japan: { lat: 35.6762, lng: 139.6503 },
      amalfi: { lat: 40.6340, lng: 14.6027 },
      italy: { lat: 41.8719, lng: 12.5674 },
      paris: { lat: 48.8566, lng: 2.3522 },
      swiss: { lat: 45.9763, lng: 7.7491 },
      alps: { lat: 45.9763, lng: 7.7491 },
      bali: { lat: -8.4095, lng: 115.1889 }
    };

    let baseCoord = { lat: 35.6762, lng: 139.6503 };
    const destLower = (currentTrip.destination || '').toLowerCase();
    for (const key in destCoords) {
      if (destLower.includes(key)) {
        baseCoord = destCoords[key];
        break;
      }
    }

    // Add slight offset for marker separation
    const randomOffset = (Math.random() - 0.5) * 0.04;
    const markerLat = baseCoord.lat + randomOffset;
    const markerLng = baseCoord.lng + randomOffset;

    try {
      const res = await api.post(`/trips/${currentTrip._id}/activities`, {
        dayNumber: selectedDay,
        title: newTitle,
        category: newCategory,
        time: newTime,
        location: {
          name: newLocationName || currentTrip.destination,
          lat: markerLat,
          lng: markerLng
        },
        cost: Number(newCost) || 0,
        notes: newNotes
      });

      if (res.data?.data) {
        setActivities([...activities, res.data.data]);
        setIsActivityModalOpen(false);
        setNewTitle('');
        setNewLocationName('');
        setNewCost('0');
        setNewNotes('');
      }
    } catch (err) {
      console.error('Failed to create activity', err);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await api.delete(`/activities/${activityId}`);
      setActivities(activities.filter((a) => a._id !== activityId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveActivity = async (activityId, direction) => {
    const list = [...dayActivities];
    const index = list.findIndex((a) => a._id === activityId);
    if (index < 0) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= list.length) return;

    // Swap in array
    const item = list[index];
    list[index] = list[newIndex];
    list[newIndex] = item;

    // Update order values
    list.forEach((act, i) => { act.order = i; });

    // Update state
    setActivities((prev) => {
      const otherDays = prev.filter((a) => a.dayNumber !== selectedDay);
      return [...otherDays, ...list];
    });

    // Notify backend
    try {
      await api.patch(`/trips/${currentTrip._id}/activities/reorder`, {
        activityId,
        newPosition: newIndex
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToDay = async (activityId, targetDay) => {
    try {
      await api.patch(`/trips/${currentTrip._id}/activities/reorder`, {
        activityId,
        targetDay: Number(targetDay)
      });
      setActivities((prev) =>
        prev.map((a) => (a._id === activityId ? { ...a, dayNumber: Number(targetDay) } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Invite handler
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      const res = await api.post(`/trips/${currentTrip._id}/invites`, {
        email: inviteEmail,
        role: inviteRole
      });
      if (res.data?.success) {
        setInviteSuccess(`Invited ${inviteEmail} as ${inviteRole}!`);
        setInviteEmail('');
        setTimeout(() => setInviteSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Packing list handlers
  const handleAddPackingItem = async (e) => {
    e.preventDefault();
    if (!newPackingLabel) return;
    try {
      const res = await api.post(`/trips/${currentTrip._id}/packing`, {
        label: newPackingLabel
      });
      if (res.data?.data) {
        setPackingItems([...packingItems, res.data.data]);
        setNewPackingLabel('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePacking = async (itemId) => {
    try {
      await api.patch(`/packing/${itemId}`);
      setPackingItems((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, isPacked: !item.isPacked } : item))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePacking = async (itemId) => {
    try {
      await api.delete(`/packing/${itemId}`);
      setPackingItems(packingItems.filter((i) => i._id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  // Budget calculations
  const totalPlannedSpent = activities.reduce((acc, a) => acc + (Number(a.cost) || 0), 0);
  const targetBudget = Number(currentTrip.budget) || 0;
  const budgetRatio = targetBudget > 0 ? (totalPlannedSpent / targetBudget) * 100 : 0;

  // Category breakdown
  const categoryTotals = activities.reduce((acc, act) => {
    const cat = act.category || 'other';
    acc[cat] = (acc[cat] || 0) + (Number(act.cost) || 0);
    return acc;
  }, {});

  // Coordinates for Map
  const validMapActivities = activities.filter(
    (a) => a.location?.lat && a.location?.lng && a.dayNumber === selectedDay
  );

  const defaultCenter = validMapActivities.length > 0
    ? [validMapActivities[0].location.lat, validMapActivities[0].location.lng]
    : [35.6762, 139.6503];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Nav: Back button, role, and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Trips</span>
        </Link>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Role badge */}
          <span className="text-xs text-stone-500">
            Role:{' '}
            <span className="font-semibold text-stone-800 uppercase px-2 py-0.5 rounded-md bg-stone-100 text-[11px]">
              {currentTripRole || 'viewer'}
            </span>
          </span>

          {/* Invite friend button */}
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-stone-600" />
            <span>Invite Friend</span>
          </button>

          {/* Toggle public link */}
          {currentTripRole === 'owner' && (
            <button
              onClick={handleTogglePublic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isPublic
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {isPublic ? <Globe className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isPublic ? 'Publicly Shared' : 'Make Public'}</span>
            </button>
          )}

          {/* Delete Trip (Owner only) */}
          {currentTripRole === 'owner' && (
            <button
              onClick={handleDeleteTrip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Delete Trip</span>
            </button>
          )}

          {isPublic && (
            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Trip Cover Banner */}
      <div className="card-natural overflow-hidden bg-white border border-stone-200">
        <div className="relative h-48 sm:h-64 w-full bg-stone-100">
          <img
            src={currentTrip.coverUrl || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1400&q=80'}
            alt={currentTrip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-stone-900/25 to-transparent" />

          {/* Info on banner */}
          <div className="absolute bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div className="space-y-1.5 max-w-xl">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-stone-900/70 backdrop-blur-md px-2.5 py-0.5 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>{currentTrip.destination}</span>
                <span className="text-stone-400">•</span>
                <span>{totalDays} Days</span>
              </span>
              <h1 className="font-heading text-xl sm:text-3xl font-bold tracking-tight">
                {currentTrip.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-stone-200">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-300" />
                  <span>
                    {new Date(currentTrip.startDate).toLocaleDateString()} – {new Date(currentTrip.endDate).toLocaleDateString()}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Budget: {currentTrip.currency} {currentTrip.budget?.toLocaleString() || '0'}</span>
                </span>
              </div>
            </div>

            {/* Team stack */}
            <div className="flex items-center gap-2 bg-stone-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-stone-300">Travelers:</span>
              <div className="flex items-center -space-x-1.5">
                {currentTrip.ownerId?.avatarUrl && (
                  <img
                    src={currentTrip.ownerId.avatarUrl}
                    alt="Owner"
                    title={`Owner: ${currentTrip.ownerId.name}`}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-stone-900"
                  />
                )}
                {currentTrip.collaborators?.map((c, i) => (
                  <img
                    key={i}
                    src={c.userId?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt="Member"
                    title={`${c.userId?.name} (${c.role})`}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-stone-900"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-stone-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'itinerary'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Day Itinerary</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'map'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <MapIcon className="w-4 h-4 text-sky-600" />
          <span>Interactive Map</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'budget'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <PieChart className="w-4 h-4 text-amber-600" />
          <span>Budget Tracker (${totalPlannedSpent} / ${targetBudget})</span>
        </button>

        <button
          onClick={() => setActiveTab('packing')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'packing'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <ListChecks className="w-4 h-4 text-emerald-600" />
          <span>Packing Checklist ({packingItems.filter(i => i.isPacked).length}/{packingItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'summary'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Printer className="w-4 h-4 text-stone-500" />
          <span>Print Summary</span>
        </button>
      </div>

      {/* Tab 1: Day-by-Day Itinerary */}
      {activeTab === 'itinerary' && (
        <div className="space-y-4">
          
          {/* Day Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {dayNumbers.map((d) => {
              const countForDay = activities.filter((a) => a.dayNumber === d).length;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 border ${
                    selectedDay === d
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>Day {d}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedDay === d ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {countForDay}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Schedule for Selected Day */}
          <div className="card-natural p-5 sm:p-6 bg-white space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-heading text-lg font-bold text-stone-900">
                  Day {selectedDay} Schedule
                </h3>
                <p className="text-xs text-stone-500">
                  Ordered activities for Day {selectedDay}. Reorder or move activities using the quick controls.
                </p>
              </div>

              {currentTripRole !== 'viewer' && (
                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span className="text-white">Add Activity</span>
                </button>
              )}
            </div>

            {/* Activities List */}
            {dayActivities.length > 0 ? (
              <div className="space-y-2.5">
                {dayActivities.map((act, index) => {
                  const Icon = CATEGORY_ICONS[act.category] || MapPin;
                  const colorClass = CATEGORY_COLORS[act.category] || CATEGORY_COLORS.other;

                  return (
                    <div
                      key={act._id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Time, Category Icon, Title, Location */}
                      <div className="flex items-start gap-3">
                        <div className="w-12 text-center flex-shrink-0 pt-0.5">
                          <span className="text-xs font-bold text-stone-700">{act.time || '10:00'}</span>
                        </div>

                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-stone-900">{act.title}</h4>
                            <span className={`text-[10px] font-semibold px-2 py-0.2 rounded uppercase tracking-wider border ${colorClass}`}>
                              {act.category}
                            </span>
                          </div>

                          {act.location?.name && (
                            <p className="text-xs text-stone-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span>{act.location.name}</span>
                            </p>
                          )}

                          {act.notes && (
                            <p className="text-xs text-stone-600 italic bg-white/70 p-1.5 rounded border border-stone-200/60 mt-1 max-w-lg">
                              {act.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Cost and Reorder actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                        {act.cost > 0 && (
                          <span className="text-xs font-bold text-stone-900 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
                            ${act.cost}
                          </span>
                        )}

                        {/* Controls (Editor / Owner only) */}
                        {currentTripRole !== 'viewer' && (
                          <div className="flex items-center gap-1">
                            {/* Move Up */}
                            <button
                              onClick={() => handleMoveActivity(act._id, 'up')}
                              disabled={index === 0}
                              title="Move up"
                              className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 rounded hover:bg-stone-200"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>

                            {/* Move Down */}
                            <button
                              onClick={() => handleMoveActivity(act._id, 'down')}
                              disabled={index === dayActivities.length - 1}
                              title="Move down"
                              className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 rounded hover:bg-stone-200"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Move to another day dropdown */}
                            <select
                              value={act.dayNumber}
                              onChange={(e) => handleMoveToDay(act._id, e.target.value)}
                              title="Move to another day"
                              className="text-[11px] py-1 px-1.5 rounded bg-white border border-stone-200 text-stone-700"
                            >
                              {dayNumbers.map((d) => (
                                <option key={d} value={d}>
                                  To Day {d}
                                </option>
                              ))}
                            </select>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteActivity(act._id)}
                              title="Delete activity"
                              className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-stone-200 rounded-xl space-y-2">
                <p className="text-xs text-stone-500">No activities scheduled for Day {selectedDay} yet.</p>
                {currentTripRole !== 'viewer' && (
                  <button
                    onClick={() => setIsActivityModalOpen(true)}
                    style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span className="text-white">Add First Activity</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Leaflet Interactive Map */}
      {activeTab === 'map' && (
        <div className="card-natural p-5 bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h3 className="font-heading text-base font-bold text-stone-900">
                Interactive Map — Day {selectedDay} Stops
              </h3>
              <p className="text-xs text-stone-500">
                Numbered markers for scheduled activities using OpenStreetMap tiles.
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
              {validMapActivities.length} Location Markers
            </span>
          </div>

          <div className="h-[460px] w-full rounded-xl overflow-hidden border border-stone-200 relative">
            <MapContainer
              center={defaultCenter}
              zoom={13}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {validMapActivities.map((act, idx) => (
                <Marker
                  key={act._id}
                  position={[act.location.lat, act.location.lng]}
                >
                  <Popup>
                    <div className="text-stone-900 font-sans p-1 text-xs space-y-1">
                      <p className="font-bold text-sm">{idx + 1}. {act.title}</p>
                      <p className="text-stone-600">{act.time} • {act.category}</p>
                      {act.location?.name && <p className="text-stone-500">📍 {act.location.name}</p>}
                      {act.cost > 0 && <p className="font-semibold text-emerald-700">${act.cost}</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Tab 3: Budget Tracker */}
      {activeTab === 'budget' && (
        <div className="card-natural p-6 bg-white space-y-6">
          <div className="pb-3 border-b border-stone-100">
            <h3 className="font-heading text-lg font-bold text-stone-900">
              Trip Budget & Category Breakdown
            </h3>
            <p className="text-xs text-stone-500">
              Compare your target spending against planned activity expenses.
            </p>
          </div>

          {/* Progress Overview Bar */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700">Total Planned Spending</span>
              <span className="font-bold text-stone-900">
                ${totalPlannedSpent} / ${targetBudget} ({Math.round(budgetRatio)}%)
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-stone-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetRatio > 100
                    ? 'bg-rose-500'
                    : budgetRatio > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, budgetRatio)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span>Remaining balance: ${Math.max(0, targetBudget - totalPlannedSpent)}</span>
              {budgetRatio > 100 && (
                <span className="text-rose-600 font-bold">Over budget by ${totalPlannedSpent - targetBudget}</span>
              )}
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.keys(CATEGORY_ICONS).map((cat) => {
              const spent = categoryTotals[cat] || 0;
              const Icon = CATEGORY_ICONS[cat];
              const pct = totalPlannedSpent > 0 ? Math.round((spent / totalPlannedSpent) * 100) : 0;

              return (
                <div key={cat} className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-stone-600" />
                    <span className="text-xs font-bold capitalize text-stone-800">{cat}</span>
                  </div>
                  <p className="text-base font-extrabold text-stone-900">${spent}</p>
                  <p className="text-[11px] text-stone-500">{pct}% of planned total</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Packing Checklist */}
      {activeTab === 'packing' && (
        <div className="card-natural p-6 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-heading text-lg font-bold text-stone-900">
                Packing Checklist
              </h3>
              <p className="text-xs text-stone-500">
                Track essentials and check items off together with your group.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setPackingFilter('all')}
                className={`px-2.5 py-1 rounded-md ${packingFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}
              >
                All ({packingItems.length})
              </button>
              <button
                onClick={() => setPackingFilter('unpacked')}
                className={`px-2.5 py-1 rounded-md ${packingFilter === 'unpacked' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}
              >
                To Pack ({packingItems.filter(i => !i.isPacked).length})
              </button>
              <button
                onClick={() => setPackingFilter('packed')}
                className={`px-2.5 py-1 rounded-md ${packingFilter === 'packed' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}
              >
                Packed ({packingItems.filter(i => i.isPacked).length})
              </button>
            </div>
          </div>

          {/* Add item input */}
          {currentTripRole !== 'viewer' && (
            <form onSubmit={handleAddPackingItem} className="flex gap-2">
              <input
                type="text"
                value={newPackingLabel}
                onChange={(e) => setNewPackingLabel(e.target.value)}
                placeholder="Add packing item (e.g. Travel adapter, Passport, Rain jacket)..."
                className="flex-1 px-3.5 py-2 input-natural text-xs sm:text-sm"
              />
              <button
                type="submit"
                style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
              >
                Add Item
              </button>
            </form>
          )}

          {/* Packing items list */}
          <div className="divide-y divide-stone-100">
            {packingItems
              .filter((item) => {
                if (packingFilter === 'packed') return item.isPacked;
                if (packingFilter === 'unpacked') return !item.isPacked;
                return true;
              })
              .map((item) => (
                <div key={item._id} className="py-2.5 flex items-center justify-between gap-3 group">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isPacked}
                      onChange={() => handleTogglePacking(item._id)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`text-xs sm:text-sm ${item.isPacked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                      {item.label}
                    </span>
                  </label>

                  {currentTripRole !== 'viewer' && (
                    <button
                      onClick={() => handleDeletePacking(item._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 5: Summary / Printable View */}
      {activeTab === 'summary' && (
        <div className="card-natural p-6 bg-white space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h2 className="font-heading text-xl font-bold text-stone-900">{currentTrip.title}</h2>
              <p className="text-xs text-stone-500">{currentTrip.destination} • {totalDays} Days</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Itinerary</span>
            </button>
          </div>

          <div className="space-y-6">
            {dayNumbers.map((d) => {
              const acts = activities.filter((a) => a.dayNumber === d).sort((a, b) => a.order - b.order);
              return (
                <div key={d} className="space-y-2">
                  <h4 className="font-heading text-sm font-bold text-stone-800 border-b border-stone-100 pb-1">
                    Day {d}
                  </h4>
                  {acts.length > 0 ? (
                    <ul className="space-y-1 text-xs">
                      {acts.map((a) => (
                        <li key={a._id} className="flex items-start gap-2 text-stone-700">
                          <span className="font-bold text-stone-900 w-12">{a.time}</span>
                          <span className="font-semibold">{a.title}</span>
                          {a.location?.name && <span className="text-stone-500">({a.location.name})</span>}
                          {a.cost > 0 && <span className="text-emerald-700 font-medium">${a.cost}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-stone-400 italic">No scheduled activities.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Activity */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-stone-200 p-6 shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-heading text-base font-bold text-stone-900">
                Add Activity for Day {selectedDay}
              </h3>
              <button onClick={() => setIsActivityModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Visit Meiji Shrine & Walk Yoyogi Park"
                  className="w-full px-3 py-2 input-natural text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-2 input-natural text-xs sm:text-sm bg-white"
                  >
                    <option value="sightseeing">Sightseeing</option>
                    <option value="food">Food & Dining</option>
                    <option value="transport">Transit / Taxi</option>
                    <option value="hotel">Accommodation</option>
                    <option value="flight">Flight</option>
                    <option value="activity">Activity / Tour</option>
                    <option value="shopping">Shopping</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-2.5 py-2 input-natural text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Location Name</label>
                  <input
                    type="text"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder="e.g. Yoyogi Park, Shibuya"
                    className="w-full px-3 py-2 input-natural text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 input-natural text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows="2"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Bring cash for shrine charms and umbrellas if rainy."
                  className="w-full px-3 py-2 input-natural text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Invite Collaborator */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-stone-200 p-6 shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <h3 className="font-heading text-base font-bold text-stone-900">
                  Invite Trip Companion
                </h3>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {inviteSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {inviteSuccess}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Friend's Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@traveler.io"
                    className="w-full pl-9 pr-3.5 py-2 input-natural text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Permission Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-2.5 py-2 input-natural text-xs sm:text-sm bg-white"
                >
                  <option value="editor">Editor (Can add/edit/reorder activities)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Done
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
