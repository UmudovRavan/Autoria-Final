import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.tsx';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import CarDetail from './pages/CarDetail';
import MyBids from './pages/MyBids';
import ConfirmEmail from './pages/ConfirmEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/auctions" element={
              <ProtectedRoute>
                <Auctions />
              </ProtectedRoute>
            } />
            
            <Route path="/auctions/:auctionId" element={
              <ProtectedRoute>
                <AuctionDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/auctions/:auctionId/cars/:carId" element={
              <ProtectedRoute>
                <CarDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/my-bids" element={
              <ProtectedRoute>
                <MyBids />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;