import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.tsx';
import { LanguageProvider } from './hooks/useLanguage.tsx';
import { ToastProvider } from './components/ToastProvider';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Presentation Pages
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
import VehicleFinder from './pages/VehicleFinder';
import SalesList from './pages/SalesList';
import AuctionCars from './pages/AuctionCars';
import Watchlist from './pages/Watchlist';
import TodaysAuctions from './pages/TodaysAuctions';
import AuctionCalendar from './pages/AuctionCalendar';
import AuctionJoinPage from './pages/AuctionJoinPage';
import AddVehicle from './pages/AddVehicle';
import MyVehicle from './pages/MyVehicle';
import AdminLogin from './pages/AdminLogin';

// Admin Pages
import AdminApp from './admin/App';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
        <Router>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/*" element={<AdminApp />} />
            
            {/* Presentation Routes */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
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
                  
                  <Route path="/vehicle-finder" element={
                    <ProtectedRoute>
                      <VehicleFinder />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/sales-list" element={
                    <ProtectedRoute>
                      <SalesList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/auction/:auctionId/cars" element={
                    <ProtectedRoute>
                      <AuctionCars />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/watchlist" element={
                    <ProtectedRoute>
                      <Watchlist />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/todays-auctions" element={
                    <ProtectedRoute>
                      <TodaysAuctions />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/auctions/calendar" element={
                    <ProtectedRoute>
                      <AuctionCalendar />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/auctions/join" element={
                    <ProtectedRoute>
                      <AuctionJoinPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/auctions/:auctionId/join" element={
                    <ProtectedRoute>
                      <AuctionJoinPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Demo route for testing Join Auction page */}
                  <Route path="/demo-join" element={
                    <ProtectedRoute>
                      <AuctionJoinPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/add-vehicle" element={
                    <ProtectedRoute>
                      <AddVehicle />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/my-vehicles" element={
                    <ProtectedRoute>
                      <MyVehicle />
                    </ProtectedRoute>
                  } />
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Router>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;