const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    dayNumber: {
      type: Number,
      required: true,
      min: 1
    },
    order: {
      type: Number,
      required: true,
      default: 0
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['sightseeing', 'food', 'transport', 'hotel', 'flight', 'activity', 'shopping', 'other'],
      default: 'sightseeing'
    },
    time: {
      type: String,
      default: '09:00'
    },
    location: {
      name: {
        type: String,
        default: ''
      },
      lat: {
        type: Number,
        default: null
      },
      lng: {
        type: Number,
        default: null
      }
    },
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast day ordering and reordering queries
activitySchema.index({ tripId: 1, dayNumber: 1, order: 1 });

module.exports = mongoose.model('Activity', activitySchema);
