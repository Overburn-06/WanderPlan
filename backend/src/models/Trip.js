const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const collaboratorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'viewer'
    }
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
      maxlength: 5
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, 'Budget cannot be negative']
    },
    coverUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
    },
    collaborators: [collaboratorSchema],
    shareToken: {
      type: String,
      default: () => nanoid(12),
      unique: true,
      sparse: true
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for total days calculated from dates
tripSchema.virtual('totalDays').get(function () {
  if (!this.startDate || !this.endDate) return 1;
  const diffTime = Math.abs(new Date(this.endDate) - new Date(this.startDate));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
});

module.exports = mongoose.model('Trip', tripSchema);
