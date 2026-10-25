const { validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const PackingItem = require('../models/PackingItem');
const User = require('../models/User');
const { nanoid } = require('nanoid');

// @desc    Get all trips owned or shared with the user
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const trips = await Trip.find({
      $or: [{ ownerId: userId }, { 'collaborators.userId': userId }]
    })
      .populate('ownerId', 'name email avatarUrl')
      .populate('collaborators.userId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { title, destination, startDate, endDate, currency, budget, coverUrl } = req.body;

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after start date'
      });
    }

    const trip = await Trip.create({
      ownerId: req.user._id,
      title,
      destination,
      startDate,
      endDate,
      currency: currency || 'USD',
      budget: budget || 0,
      coverUrl: coverUrl || undefined,
      collaborators: []
    });

    const populated = await Trip.findById(trip._id).populate('ownerId', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip by ID with activities & packing items
// @route   GET /api/trips/:id
// @access  Private (Owner, Editor, or Viewer)
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('ownerId', 'name email avatarUrl')
      .populate('collaborators.userId', 'name email avatarUrl');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Determine current user's role
    const userId = req.user._id.toString();
    const isOwner = trip.ownerId._id.toString() === userId;
    const collaborator = trip.collaborators.find(
      (c) => c.userId && c.userId._id.toString() === userId
    );

    if (!isOwner && !collaborator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this trip'
      });
    }

    const role = isOwner ? 'owner' : collaborator.role;

    // Fetch activities and packing items
    const activities = await Activity.find({ tripId: trip._id }).sort({ dayNumber: 1, order: 1 });
    const packingItems = await PackingItem.find({ tripId: trip._id }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: trip,
      activities,
      packingItems,
      userRole: role
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private (Owner or Editor)
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const { title, destination, startDate, endDate, currency, budget, coverUrl } = req.body;

    if (title) trip.title = title;
    if (destination) trip.destination = destination;
    if (startDate) trip.startDate = startDate;
    if (endDate) trip.endDate = endDate;
    if (currency) trip.currency = currency;
    if (budget !== undefined) trip.budget = budget;
    if (coverUrl) trip.coverUrl = coverUrl;

    await trip.save();

    const updated = await Trip.findById(trip._id)
      .populate('ownerId', 'name email avatarUrl')
      .populate('collaborators.userId', 'name email avatarUrl');

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private (Owner only)
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    await Trip.findByIdAndDelete(req.params.id);
    await Activity.deleteMany({ tripId: req.params.id });
    await PackingItem.deleteMany({ tripId: req.params.id });

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add activity to trip
// @route   POST /api/trips/:id/activities
// @access  Private
const addActivity = async (req, res, next) => {
  try {
    const { dayNumber, title, category, time, location, cost, notes } = req.body;

    const count = await Activity.countDocuments({ tripId: req.params.id, dayNumber });

    const activity = await Activity.create({
      tripId: req.params.id,
      dayNumber: Number(dayNumber) || 1,
      order: count,
      title: title || 'New Activity',
      category: category || 'sightseeing',
      time: time || '10:00',
      location: location || { name: '', lat: null, lng: null },
      cost: Number(cost) || 0,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res, next) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder / Move activities
// @route   PATCH /api/trips/:id/activities/reorder
// @access  Private
const reorderActivities = async (req, res, next) => {
  try {
    const { activityId, targetDay, newPosition } = req.body;
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    if (targetDay !== undefined) {
      activity.dayNumber = Number(targetDay);
    }
    if (newPosition !== undefined) {
      activity.order = Number(newPosition);
    }

    await activity.save();

    const allActivities = await Activity.find({ tripId: req.params.id }).sort({ dayNumber: 1, order: 1 });
    res.json({ success: true, data: allActivities });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite collaborator
// @route   POST /api/trips/:id/invites
// @access  Private
const inviteCollaborator = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Check if user exists
    let invitee = await User.findOne({ email: email.toLowerCase() });
    if (!invitee) {
      // Create guest user profile if not exists
      invitee = await User.create({
        name: email.split('@')[0],
        email: email.toLowerCase(),
        passwordHash: await User.hashPassword('Password123!'),
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`
      });
    }

    // Add to collaborators if not already
    const exists = trip.collaborators.some((c) => c.userId.toString() === invitee._id.toString());
    if (!exists) {
      trip.collaborators.push({
        userId: invitee._id,
        role: role || 'viewer'
      });
      await trip.save();
    }

    const updated = await Trip.findById(trip._id)
      .populate('ownerId', 'name email avatarUrl')
      .populate('collaborators.userId', 'name email avatarUrl');

    res.json({
      success: true,
      message: `Invited ${email} as ${role || 'viewer'}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle share token
// @route   PATCH /api/trips/:id/share
// @access  Private
const toggleShare = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const { isPublic, regenerateToken } = req.body;

    if (typeof isPublic === 'boolean') {
      trip.isPublic = isPublic;
    }
    if (regenerateToken || !trip.shareToken) {
      trip.shareToken = nanoid(12);
    }

    await trip.save();

    res.json({
      success: true,
      data: {
        isPublic: trip.isPublic,
        shareToken: trip.shareToken,
        shareUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/${trip.shareToken}`
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip by public share token
// @route   GET /api/public/trips/:shareToken
// @access  Public
const getPublicTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      shareToken: req.params.shareToken,
      isPublic: true
    }).populate('ownerId', 'name avatarUrl');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Public trip not found or link has been disabled'
      });
    }

    const activities = await Activity.find({ tripId: trip._id }).sort({
      dayNumber: 1,
      order: 1
    });

    res.json({
      success: true,
      data: {
        trip,
        activities
      }
    });
  } catch (error) {
    next(error);
  }
};

// Packing Item Handlers
const addPackingItem = async (req, res, next) => {
  try {
    const item = await PackingItem.create({
      tripId: req.params.id,
      label: req.body.label || 'New Item',
      isPacked: false
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const togglePackingItem = async (req, res, next) => {
  try {
    const item = await PackingItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.isPacked = !item.isPacked;
    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const deletePackingItem = async (req, res, next) => {
  try {
    await PackingItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  addActivity,
  updateActivity,
  deleteActivity,
  reorderActivities,
  inviteCollaborator,
  toggleShare,
  getPublicTrip,
  addPackingItem,
  togglePackingItem,
  deletePackingItem
};
