const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const inviteSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'viewer'
    },
    token: {
      type: String,
      default: () => nanoid(24),
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'pending'
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from creation
    }
  },
  {
    timestamps: true
  }
);

// TTL Index: Document expires automatically when current time >= expiresAt
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Invite', inviteSchema);
