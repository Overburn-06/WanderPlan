const express = require('express');
const { body } = require('express-validator');
const {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  toggleShare,
  getPublicTrip,
  addActivity,
  updateActivity,
  deleteActivity,
  reorderActivities,
  inviteCollaborator,
  addPackingItem,
  togglePackingItem,
  deletePackingItem
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public trip route by token
router.get('/public/trips/:shareToken', getPublicTrip);

// Private trip routes
router.use(protect);

router
  .route('/')
  .get(getTrips)
  .post(
    [
      body('title', 'Trip title is required').trim().notEmpty(),
      body('destination', 'Destination is required').trim().notEmpty(),
      body('startDate', 'Valid start date is required').isISO8601(),
      body('endDate', 'Valid end date is required').isISO8601()
    ],
    createTrip
  );

router
  .route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

router.patch('/:id/share', toggleShare);

// Activity routes
router.post('/:id/activities', addActivity);
router.patch('/:id/activities/reorder', reorderActivities);

// Invite route
router.post('/:id/invites', inviteCollaborator);

// Packing routes
router.post('/:id/packing', addPackingItem);

module.exports = router;
