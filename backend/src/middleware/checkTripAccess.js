const Trip = require('../models/Trip');

/**
 * Middleware factory to authorize access to trips and enforce collaboration roles
 * @param {'viewer' | 'editor' | 'owner'} minRole - Minimum role required
 */
const checkTripAccess = (minRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const tripId = req.params.id || req.params.tripId;
      if (!tripId) {
        return res.status(400).json({ success: false, message: 'Trip ID is required' });
      }

      const trip = await Trip.findById(tripId).populate('collaborators.userId', 'name email avatarUrl');
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Trip not found' });
      }

      const currentUserId = req.user._id.toString();
      const isOwner = trip.ownerId.toString() === currentUserId;

      let collaboratorRole = null;
      const collab = trip.collaborators.find(
        (c) => c.userId && (c.userId._id ? c.userId._id.toString() : c.userId.toString()) === currentUserId
      );
      if (collab) {
        collaboratorRole = collab.role;
      }

      let effectiveRole = null;
      if (isOwner) {
        effectiveRole = 'owner';
      } else if (collaboratorRole) {
        effectiveRole = collaboratorRole;
      }

      // Check role hierarchy: owner > editor > viewer
      const roleRank = { viewer: 1, editor: 2, owner: 3 };

      if (!effectiveRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view or edit this trip'
        });
      }

      if (roleRank[effectiveRole] < roleRank[minRole]) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: This action requires at least '${minRole}' role, your role is '${effectiveRole}'`
        });
      }

      req.trip = trip;
      req.userRole = effectiveRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkTripAccess };
