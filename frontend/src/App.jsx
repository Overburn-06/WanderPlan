import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TripDetailsPage from './pages/TripDetailsPage';
import PublicSharedTripPage from './pages/PublicSharedTripPage';

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isSharedPage = location.pathname.startsWith('/shared/');

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] text-slate-800">
      {/* Show Navbar on non-auth and non-shared pages */}
      {!isAuthPage && !isSharedPage && (
        <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Public Shared Trip View */}
          <Route path="/shared/:shareToken" element={<PublicSharedTripPage />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage
                  isCreateModalOpen={isCreateModalOpen}
                  setIsCreateModalOpen={setIsCreateModalOpen}
                />
              </ProtectedRoute>
            }
          />

          {/* Protected Trip Details Route */}
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <TripDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer on non-auth and non-shared pages */}
      {!isAuthPage && !isSharedPage && <Footer />}
    </div>
  );
}
