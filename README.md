# WanderPlan — Collaborative Trip Planning Application

A modern, full-stack collaborative travel planner and itinerary builder built with **React 18**, **Vite**, **Tailwind CSS**, **Node.js/Express**, and **MongoDB**.

Designed with a clean, natural cool-contrast aesthetic (`#eef2f6` canvas), focused micro-interactions, and role-based permissions.

---

## 🌟 Key Features

### 1. Itinerary & Day-by-Day Planning
- **Auto Day Generation**: Enter trip start and end dates to dynamically generate day-by-day tabs.
- **Activity Timeline**: Add activities with title, category, time, location (with latitude/longitude), cost, and notes.
- **Reordering & Day Shifting**: Reorder activities within a day (`Move Up`, `Move Down`) or move them across days.
- **Category Tags**: Color-coded category tags for *Flight*, *Sightseeing*, *Food*, *Transport*, *Hotel*, and *Activity*.

### 2. Interactive Leaflet Map
- **OpenStreetMap Integration**: Powered by `react-leaflet` and OpenStreetMap tiles.
- **Numbered Map Pins**: Visualizes all activities for the selected day directly on an interactive map.
- **Quick Info Popups**: Click any pin to see the activity title, time, and planned cost.

### 3. Budget & Expense Tracking
- **Budget Progress**: Real-time spending progress against the total trip budget.
- **Category Breakdown**: Aggregates costs by Flight, Food, Stay, Activities, and Transport.
- **Currency Support**: Supports USD ($), EUR (€), GBP (£), and JPY (¥).

### 4. Interactive Packing Checklist
- **Pre-trip Checklist**: Add items to pack for the trip.
- **Instant Toggle**: Mark items as packed or unpacked with live state updates.
- **Delete Items**: Remove packing items when no longer needed.

### 5. Collaboration & Access Control
- **Role Hierarchy**: 
  - `owner`: Full control, invite collaborators, edit all items, delete trip.
  - `editor`: Add, modify, and reorder activities and packing items.
  - `viewer`: Read-only access to the trip plan.
- **IDOR Protection**: Backend middleware enforces ownership and role validation on all trip mutations.
- **Token-based Invitations**: 7-day expiring invite links backed by MongoDB TTL index.
- **Public Share Links**: Read-only public URLs (`/shared/:shareToken`) generated with unguessable `nanoid` tokens.

### 6. Trip Management & Deletion
- **Dashboard Overview**: Filter trips by *All*, *My Trips*, or *Shared with Me*.
- **Delete Trip**: Owners can delete a trip with a safe confirmation modal from both the dashboard card and inside the trip details page.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Redux Toolkit, React Router v6, Lucide React, React-Leaflet v4, Leaflet v1.9 |
| **Backend** | Node.js, Express, Mongoose / MongoDB, JWT, Bcrypt.js, Helmet, CORS, Morgan, Nanoid |
| **Database** | MongoDB with TTL indexes for expiring invitations & compound indexes for activity ordering |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ recommended
- **MongoDB**: v6+ running locally on port `27017` (or provide a remote MongoDB URI)

---

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment variables (or copy from .env.example)
cp .env.example .env

# Seed initial demo data (users, sample trips, activities, packing items)
npm run seed
# or: node seed.js

# Start backend server (runs on http://localhost:5000)
npm run dev
# or: node server.js
```

#### Demo Credentials (from Seed)
| User | Email | Password |
|---|---|---|
| Alex Traveler | `alex@traveler.io` | `Password123!` |
| Sarah Wanderer | `sarah@wanderer.com` | `Password123!` |

---

### 2. Frontend Setup

```bash
cd ../frontend
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current user profile

### Trips (`/api/trips`)
- `GET /api/trips` — Fetch all trips owned by or shared with current user
- `POST /api/trips` — Create a new trip
- `GET /api/trips/:id` — Get trip details, activities, collaborators, and packing list
- `PUT /api/trips/:id` — Update trip metadata (title, dates, budget)
- `DELETE /api/trips/:id` — Delete trip (owner only)

### Activities (`/api/trips/:id/activities` & `/api/activities`)
- `POST /api/trips/:id/activities` — Add a new activity to a day
- `PUT /api/activities/:id` — Update activity details
- `DELETE /api/activities/:id` — Delete activity
- `PATCH /api/trips/:id/activities/reorder` — Persist reordered activities

### Collaboration & Sharing
- `POST /api/trips/:id/invites` — Generate collaborator invite link (owner/editor)
- `PATCH /api/trips/:id/share` — Toggle public read-only link on/off
- `GET /api/public/trips/:shareToken` — Public read-only trip viewer (no auth required)

### Packing Checklist
- `POST /api/trips/:id/packing` — Add item to packing list
- `PATCH /api/packing/:id` — Toggle packed status
- `DELETE /api/packing/:id` — Remove item

---

## 🎨 Design Philosophy
- **Natural Cool-Contrast Canvas**: Soft `#eef2f6` page background with crisp white elevated cards and subtle slate borders.
- **Prominent High-Contrast Actions**: Solid indigo `#4f46e5` buttons ensure clear affordance across all viewports.
- **Split-Screen Authentication**: Visual hero card on the left with clean, focused credential inputs on the right.

---

## 📄 License
MIT

---

## 👥 Team & Contributors

This project was built collaboratively by our team:

| Contributor | GitHub / Email | Role & Key Contributions |
|---|---|---|
| **Agam** | [`bhardwajag06@gmail.com`](mailto:bhardwajag06@gmail.com) | **Full-Stack Integration** — Workspace configuration, seed scripts, integration testing, and documentation |
| **Fanibhushan** | [`technozap5002@gmail.com`](mailto:technozap5002@gmail.com) | **Backend Architecture & Auth UI** — Express server setup, Trip/Activity CRUD APIs, Login/Signup interfaces, and public sharing |
| **Shiv** | [`tysonshiv8@gmail.com`](mailto:tysonshiv8@gmail.com) | **Database & Geospatial Engineering** — Mongoose data models, Redux Toolkit state slices, and interactive Leaflet map integration |
| **Arunveer & Agam** | [`aulakharunveer@gmail.com`](mailto:aulakharunveer@gmail.com) | **Frontend UI & API Security** — JWT authentication middleware, Tailwind styling system, navigation, and dashboard components |

