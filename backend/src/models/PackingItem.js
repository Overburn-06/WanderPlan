const mongoose = require('mongoose');

const packingItemSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    isPacked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PackingItem', packingItemSchema);
