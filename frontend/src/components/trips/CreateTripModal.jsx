import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTrip } from '../../store/slices/tripSlice';
import { 
  X, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Check,
  Plane
} from 'lucide-react';

const COVER_PRESETS = [
  { name: 'Tokyo, Japan', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Amalfi Coast, Italy', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Swiss Alps', url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Paris, France', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Bali, Indonesia', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Santorini, Greece', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' }
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CHF'];

export default function CreateTripModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.trips);

  const [destination, setDestination] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-22');
  const [currency, setCurrency] = useState('USD');
  const [budget, setBudget] = useState('2500');
  const [coverUrl, setCoverUrl] = useState(COVER_PRESETS[0].url);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) return 0;
    return Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays();

  const handleDestinationSelect = (destName, presetCover) => {
    setDestination(destName);
    if (!title || title.includes('Trip') || title.includes('Getaway')) {
      setTitle(`${destName} Trip`);
    }
    if (presetCover) {
      setCoverUrl(presetCover);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (totalDays <= 0) {
      setErrorMsg('End date must be on or after start date');
      return;
    }

    try {
      const resultAction = await dispatch(
        createTrip({
          title,
          destination,
          startDate,
          endDate,
          currency,
          budget: Number(budget) || 0,
          coverUrl
        })
      );

      if (createTrip.fulfilled.match(resultAction)) {
        onClose();
        setDestination('');
        setTitle('');
      } else {
        setErrorMsg(resultAction.payload || 'Failed to create trip');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-indigo-100 p-6 sm:p-7 shadow-xl z-10 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">Plan a New Trip</h3>
              <p className="text-xs text-slate-500">Day cards are generated automatically from your travel dates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Quick Destination Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Destination
              </label>
              <span className="text-[11px] text-slate-400">Popular ideas:</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COVER_PRESETS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleDestinationSelect(item.name, item.url)}
                  className="text-xs px-2.5 py-1 rounded-md bg-sky-50/80 hover:bg-sky-100 border border-sky-200/80 text-sky-800 transition-colors font-medium"
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="trip-destination-input"
                type="text"
                required
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  if (!title) setTitle(`${e.target.value} Trip`);
                }}
                placeholder="e.g. Kyoto, Japan or Florence, Italy"
                className="w-full pl-9 pr-3.5 py-2 input-aesthetic text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trip Title
            </label>
            <input
              id="trip-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autumn Culinary & Temple Tour"
              className="w-full px-3.5 py-2 input-aesthetic text-xs sm:text-sm"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                id="trip-startdate-input"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 input-aesthetic text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date
              </label>
              <input
                id="trip-enddate-input"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 input-aesthetic text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Duration badge */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-50/80 border border-sky-100 text-xs">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Calculated Length:</span>
            </span>
            <span className="font-semibold text-indigo-800">
              {totalDays > 0 ? `${totalDays} Days (${totalDays - 1} Nights)` : 'Invalid Date Range'}
            </span>
          </div>

          {/* Budget & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-2.5 py-2 input-aesthetic text-xs sm:text-sm bg-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Budget Target ({currency})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  id="trip-budget-input"
                  type="number"
                  min="0"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="2500"
                  className="w-full pl-8 pr-3.5 py-2 input-aesthetic text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Cover Photo
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setCoverUrl(preset.url)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                    coverUrl === preset.url
                      ? 'border-indigo-600 scale-102 ring-2 ring-indigo-200'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                  {coverUrl === preset.url && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-create-trip-btn"
              type="submit"
              disabled={loading || totalDays <= 0}
              style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
