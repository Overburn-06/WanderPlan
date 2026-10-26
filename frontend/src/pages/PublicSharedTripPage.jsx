import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  ArrowLeft, 
  Layers, 
  Map as MapIcon, 
  Clock, 
  Camera, 
  Utensils, 
  Car, 
  Building, 
  Plane, 
  ShoppingBag, 
  Compass,
  Lock,
  Globe
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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

export default function PublicSharedTripPage() {
  const { shareToken } = useParams();
  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'map'

  useEffect(() => {
    if (shareToken) {
      setLoading(true);
      api.get(`/public/trips/${shareToken}`)
        .then((res) => {
          if (res.data?.data) {
            setTrip(res.data.data.trip);
            setActivities(res.data.data.activities || []);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Shared trip not found or link has expired');
          setLoading(false);
        });
    }
  }, [shareToken]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-stone-500">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
        <p className="mt-3 text-xs">Loading shared itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <div className="card-natural p-6 border-stone-200">
          <h2 className="text-base font-bold text-stone-800">Link Not Available</h2>
          <p className="text-xs text-stone-500 mt-1">{error || 'This trip is private or the link has changed.'}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-indigo-600 hover:underline"
          >
            <span>Sign in to WanderPlan</span>
          </Link>
        </div>
      </div>
    );
  }

  const totalDays = trip.totalDays || (() => {
    if (!trip.startDate || !trip.endDate) return 1;
    const diff = Math.ceil(Math.abs(new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  })();

  const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1);

  const dayActivities = activities
    .filter((a) => a.dayNumber === selectedDay)
    .sort((a, b) => a.order - b.order);

  const validMapActivities = activities.filter(
    (a) => a.location?.lat && a.location?.lng && a.dayNumber === selectedDay
  );

  const defaultCenter = validMapActivities.length > 0
    ? [validMapActivities[0].location.lat, validMapActivities[0].location.lng]
    : [35.6762, 139.6503];

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
      
      {/* Public Banner Header */}
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-amber-900">
          <Globe className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>You are viewing a <strong>read-only public itinerary</strong> shared by {trip.ownerId?.name || 'the traveler'}.</span>
        </div>
        <Link
          to="/signup"
          className="font-semibold text-indigo-700 hover:underline flex-shrink-0"
        >
          Create your own trip →
        </Link>
      </div>

      {/* Hero Cover Card */}
      <div className="card-natural overflow-hidden bg-white border border-stone-200">
        <div className="relative h-48 sm:h-64 w-full bg-stone-100">
          <img
            src={trip.coverUrl || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />

          <div className="absolute bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-6 text-white space-y-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-stone-900/70 backdrop-blur-md px-2.5 py-0.5 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>{trip.destination}</span>
              <span className="text-stone-400">•</span>
              <span>{totalDays} Days</span>
            </span>
            <h1 className="font-heading text-xl sm:text-3xl font-bold tracking-tight">
              {trip.title}
            </h1>
            <p className="text-xs text-stone-200">
              {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'itinerary' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Day Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'map' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <MapIcon className="w-4 h-4 text-sky-600" />
          <span>Map View</span>
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {dayNumbers.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedDay === d
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            Day {d}
          </button>
        ))}
      </div>

      {/* Day Schedule Content */}
      {activeTab === 'itinerary' && (
        <div className="card-natural p-5 bg-white space-y-3">
          <h3 className="font-heading text-base font-bold text-stone-900">
            Day {selectedDay} Itinerary
          </h3>

          {dayActivities.length > 0 ? (
            <div className="space-y-2.5">
              {dayActivities.map((act) => {
                const Icon = CATEGORY_ICONS[act.category] || MapPin;
                return (
                  <div key={act._id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 text-center flex-shrink-0 pt-0.5">
                        <span className="text-xs font-bold text-stone-700">{act.time || '10:00'}</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-stone-200/60 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-stone-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">{act.title}</h4>
                        {act.location?.name && (
                          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{act.location.name}</span>
                          </p>
                        )}
                        {act.notes && (
                          <p className="text-xs text-stone-600 italic mt-1">{act.notes}</p>
                        )}
                      </div>
                    </div>

                    {act.cost > 0 && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ${act.cost}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-stone-500 py-6 text-center italic">No activities listed for this day.</p>
          )}
        </div>
      )}

      {/* Map View */}
      {activeTab === 'map' && (
        <div className="card-natural p-5 bg-white space-y-3">
          <h3 className="font-heading text-base font-bold text-stone-900">
            Day {selectedDay} Location Map
          </h3>
          <div className="h-[420px] w-full rounded-xl overflow-hidden border border-stone-200">
            <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={false} className="w-full h-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {validMapActivities.map((act, idx) => (
                <Marker key={act._id} position={[act.location.lat, act.location.lng]}>
                  <Popup>
                    <div className="text-xs text-stone-900 space-y-1">
                      <p className="font-bold">{idx + 1}. {act.title}</p>
                      <p className="text-stone-600">{act.time} • {act.location?.name}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

    </div>
  );
}
