require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Trip = require('./src/models/Trip');
const Activity = require('./src/models/Activity');
const PackingItem = require('./src/models/PackingItem');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trip_planner');
    console.log('[Seed] Connected to MongoDB');

    // Clean existing data
    await User.deleteMany();
    await Trip.deleteMany();
    await Activity.deleteMany();
    await PackingItem.deleteMany();
    console.log('[Seed] Cleared existing database records');

    // Create Demo Users
    const passwordHash = await User.hashPassword('Password123!');

    const alex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@traveler.io',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
    });

    const sarah = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@wanderer.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'
    });

    const marco = await User.create({
      name: 'Marco Rossi',
      email: 'marco@explorers.org',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
    });

    console.log('[Seed] Created demo users (password: Password123!)');

    // Create Trip 1: Japan
    const trip1 = await Trip.create({
      ownerId: alex._id,
      title: 'Japan Sakura & Cultural Odyssey',
      destination: 'Tokyo & Kyoto, Japan',
      startDate: new Date('2026-11-10'),
      endDate: new Date('2026-11-18'),
      currency: 'USD',
      budget: 3500,
      coverUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      isPublic: true,
      collaborators: [
        { userId: sarah._id, role: 'editor' },
        { userId: marco._id, role: 'viewer' }
      ]
    });

    // Create Trip 2: Italy
    const trip2 = await Trip.create({
      ownerId: alex._id,
      title: 'Amalfi Coast Sunset & Capri Getaway',
      destination: 'Positano, Italy',
      startDate: new Date('2026-12-01'),
      endDate: new Date('2026-12-07'),
      currency: 'EUR',
      budget: 2800,
      coverUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      isPublic: false,
      collaborators: [
        { userId: sarah._id, role: 'editor' }
      ]
    });

    // Create Trip 3: Shared with Alex (Owned by Sarah)
    const trip3 = await Trip.create({
      ownerId: sarah._id,
      title: 'Swiss Alps Hiking & Chalet Retreat',
      destination: 'Zermatt, Switzerland',
      startDate: new Date('2027-01-15'),
      endDate: new Date('2027-01-22'),
      currency: 'CHF',
      budget: 4200,
      coverUrl: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
      isPublic: true,
      collaborators: [
        { userId: alex._id, role: 'editor' }
      ]
    });

    // Seed Sample Activities for Trip 1
    const activities = [
      {
        tripId: trip1._id,
        dayNumber: 1,
        order: 0,
        title: 'Arrive at Haneda & Narita Express',
        category: 'flight',
        time: '14:30',
        location: { name: 'Haneda Airport (HND)', lat: 35.5494, lng: 139.7798 },
        cost: 32,
        notes: 'Pick up pocket Wi-Fi and Pasmo IC transit cards at Terminal 3 arrivals.'
      },
      {
        tripId: trip1._id,
        dayNumber: 1,
        order: 1,
        title: 'Check into Shibuya Stream Hotel',
        category: 'hotel',
        time: '17:00',
        location: { name: 'Shibuya Stream Hotel', lat: 35.6575, lng: 139.7028 },
        cost: 210,
        notes: 'Reservation under Alex Rivera. Upper floor city view requested.'
      },
      {
        tripId: trip1._id,
        dayNumber: 1,
        order: 2,
        title: 'Shibuya Crossing & Izakaya Alley Dinner',
        category: 'food',
        time: '19:30',
        location: { name: 'Shibuya Nonbei Yokocho', lat: 35.6601, lng: 139.7015 },
        cost: 65,
        notes: 'Try yakitori skewers, craft highballs and ramen.'
      },
      {
        tripId: trip1._id,
        dayNumber: 2,
        order: 0,
        title: 'Morning Senso-ji Temple & Asakusa Old Town',
        category: 'sightseeing',
        time: '08:30',
        location: { name: 'Senso-ji Temple', lat: 35.7148, lng: 139.7967 },
        cost: 15,
        notes: 'Early morning to beat the crowds and browse Nakamise-dori treats.'
      },
      {
        tripId: trip1._id,
        dayNumber: 2,
        order: 1,
        title: 'teamLab Borderless Digital Art Museum',
        category: 'activity',
        time: '13:00',
        location: { name: 'Azabudai Hills', lat: 35.6605, lng: 139.7428 },
        cost: 45,
        notes: 'Tickets pre-booked on Klook. Wear comfortable flat shoes.'
      }
    ];

    await Activity.insertMany(activities);

    // Seed Sample Packing Items
    await PackingItem.insertMany([
      { tripId: trip1._id, label: 'Passport & International Driving Permit', isPacked: true },
      { tripId: trip1._id, label: 'Universal Power Adapter & Power Bank', isPacked: true },
      { tripId: trip1._id, label: 'Comfortable walking shoes (15k+ steps/day)', isPacked: false },
      { tripId: trip1._id, label: 'Rain jacket & compact umbrella', isPacked: false }
    ]);

    console.log('[Seed] Successfully seeded trips, activities, and packing items!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
