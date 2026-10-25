import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Fetch all trips (owned + shared)
export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/trips');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch trips');
    }
  }
);

// Create new trip
export const createTrip = createAsyncThunk(
  'trips/createTrip',
  async (tripData, { rejectWithValue }) => {
    try {
      const response = await api.post('/trips', tripData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create trip');
    }
  }
);

// Fetch single trip by ID
export const fetchTripById = createAsyncThunk(
  'trips/fetchTripById',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Trip not found');
    }
  }
);

// Delete trip
export const deleteTrip = createAsyncThunk(
  'trips/deleteTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      await api.delete(`/trips/${tripId}`);
      return tripId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete trip');
    }
  }
);

const initialState = {
  trips: [],
  currentTrip: null,
  currentTripRole: null,
  loading: false,
  error: null,
  filterTab: 'all', // 'all' | 'owned' | 'shared'
  searchQuery: ''
};

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setFilterTab: (state, action) => {
      state.filterTab = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearTripError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchTrips
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createTrip
      .addCase(createTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips.unshift(action.payload);
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchTripById
      .addCase(fetchTripById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTrip = action.payload.data;
        state.currentTripRole = action.payload.userRole;
      })
      .addCase(fetchTripById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteTrip
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.trips = state.trips.filter((t) => t._id !== action.payload);
        if (state.currentTrip && state.currentTrip._id === action.payload) {
          state.currentTrip = null;
        }
      });
  }
});

export const { setFilterTab, setSearchQuery, clearTripError } = tripSlice.actions;
export default tripSlice.reducer;
