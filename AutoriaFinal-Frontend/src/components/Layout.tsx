import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import { useLanguage } from '../hooks/useLanguage.tsx';
import { 
  Gavel, 
  Car, 
  Calendar, 
  User, 
  LogOut, 
  Bell,
  TrendingUp,
  Menu,
  X,
  Search,
  ChevronDown,
  Globe,
  Home,
  FileText,
  MapPin,
  HelpCircle,
  Plus,
  CreditCard,
  Clock,
  Star,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle
} from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic will be implemented later
    console.log('Searching for:', searchQuery);
  };

  // Hide navbar for auth pages (login, register, forgot-password, reset-password, confirm-email)
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/confirm-email'];
  const isAuthPage = authPages.includes(location.pathname);
  
  // If user is not authenticated OR on auth pages, show auth layout without navbar
  if (!isAuthenticated || isAuthPage) {
    // For auth pages, show only the content without navbar and footer
    if (isAuthPage) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        {children}
      </div>
    );
  }

    // For non-authenticated users (not on auth pages), show full layout
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        {/* Public Navigation */}
        <nav className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md border-b border-white/25 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <Gavel className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">{t('nav.logo')}</span>
                </Link>
              </div>
              
              {/* Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.search.placeholder')}
                      className="w-full bg-white/25 border border-white/40 rounded-xl px-4 py-2.5 text-white placeholder-blue-200 focus:bg-white/35 focus:border-blue-400 focus:outline-none transition-all duration-300 shadow-lg"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-blue-500/25"
                    >
                      {t('nav.search.button')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side */}
              <div className="flex items-center space-x-4">
                {/* Language Selector */}
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'az' | 'en')}
                    className="bg-white/25 border border-white/40 rounded-lg px-3 py-1.5 text-white text-sm focus:bg-white/35 focus:border-blue-400 focus:outline-none transition-all duration-300 shadow-lg"
                  >
                    <option value="az" className="bg-slate-800 text-white">{t('language.azerbaijani')}</option>
                    <option value="en" className="bg-slate-800 text-white">{t('language.english')}</option>
                  </select>
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center space-x-3">
                  <Link
                    to="/register"
                    className="bg-white/25 border border-white/40 text-white px-4 py-2 rounded-lg hover:bg-white/35 hover:border-blue-400 transition-all duration-300 text-sm font-medium shadow-lg"
                  >
                    {t('nav.register')}
                  </Link>
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-blue-500/25"
                  >
                    {t('nav.login')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Public Secondary Navigation */}
        <nav className="bg-gradient-to-r from-white/8 to-white/5 backdrop-blur-md border-b border-white/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              {/* Main Menu */}
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/how-it-works" className="text-white/85 hover:text-blue-200 transition-colors duration-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-white/10">
                  {t('menu.howItWorks')}
                </Link>
                
                {/* Inventory Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('inventory')}
                    className="flex items-center text-white/85 hover:text-blue-200 transition-colors duration-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-white/10"
                  >
                    {t('menu.inventory')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  {showDropdowns.inventory && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white/25 backdrop-blur-md border border-white/40 rounded-xl shadow-xl z-50">
                      <div className="py-2">
                        <Link to="/vehicle-finder" className="block px-4 py-2.5 text-sm text-white hover:bg-white/15 hover:text-blue-200 transition-colors duration-300">
                          {t('dropdown.vehicleFinder')}
                        </Link>
                        <Link to="/sales-list" className="block px-4 py-2.5 text-sm text-white hover:bg-white/15 hover:text-blue-200 transition-colors duration-300">
                          {t('dropdown.salesList')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Auctions Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('auctions')}
                    className="flex items-center text-white/85 hover:text-blue-200 transition-colors duration-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-white/10"
                  >
                    {t('menu.auctions')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  {showDropdowns.auctions && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white/25 backdrop-blur-md border border-white/40 rounded-xl shadow-xl z-50">
                      <div className="py-2">
                        <Link to="/auctions/today" className="block px-4 py-2.5 text-sm text-white hover:bg-white/15 hover:text-blue-200 transition-colors duration-300">
                          {t('dropdown.todaysAuction')}
                        </Link>
                        <Link to="/auctions/calendar" className="block px-4 py-2.5 text-sm text-white hover:bg-white/15 hover:text-blue-200 transition-colors duration-300">
                          {t('dropdown.auctionsCalendar')}
                        </Link>
                        <Link to="/auctions/join" className="block px-4 py-2.5 text-sm text-white hover:bg-white/15 hover:text-blue-200 transition-colors duration-300">
                          {t('dropdown.joinAuction')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Locations */}
                <Link to="/locations" className="text-white/85 hover:text-blue-200 transition-colors duration-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-white/10">
                  {t('menu.locations')}
                </Link>

                {/* Services & Support Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('support')}
                    className="flex items-center text-white/85 hover:text-blue-200 transition-colors duration-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-white/10"
                  >
                    {t('menu.services')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  {showDropdowns.support && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white/25 backdrop-blur-md border border-white/40 rounded-xl shadow-xl z-50">
                      <div className="py-2">
                        <Link to="/about" className="block px-4 py-2.5 text-sm text-white hover:bg-white/15 hover:text-blue-200 transition-colors duration-300">
                          {t('dropdown.aboutUs')}
                        </Link>
                        <Link to="/sell-your-car" className="block px-4 py-2.5 text-sm text-white hover:bg-white/15 hover:text-blue-200 transition-colors duration-300">
                          {t('dropdown.sellYourCar')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white/85 hover:text-blue-200 transition-colors duration-300 p-2 rounded-lg hover:bg-white/10"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-white/8 to-white/5 backdrop-blur-md border-t border-white/20 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Logo and Language */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
                    <Gavel className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">{t('nav.logo')}</span>
                </div>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'az' | 'en')}
                    className="bg-white/25 border border-white/40 rounded-lg px-3 py-2 text-white text-sm focus:bg-white/35 focus:border-blue-400 focus:outline-none transition-all duration-300 w-full shadow-lg"
                  >
                    <option value="az" className="bg-slate-800 text-white">{t('language.azerbaijani')}</option>
                    <option value="en" className="bg-slate-800 text-white">{t('language.english')}</option>
                  </select>
                </div>
              </div>

              {/* Get to Know Us */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">{t('footer.getToKnowUs')}</h3>
                <div className="space-y-3">
                  <Link to="/about" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.aboutUs')}
                  </Link>
                  <Link to="/careers" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.careers')}
                  </Link>
                  <Link to="/news" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.news')}
                  </Link>
                </div>
              </div>

              {/* Auctions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">{t('footer.auctions')}</h3>
                <div className="space-y-3">
                  <Link to="/auctions/today" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.todaysAuctions')}
                  </Link>
                  <Link to="/auctions/calendar" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.auctionsCalendar')}
                  </Link>
                  <Link to="/auctions/join" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.joinAuction')}
                  </Link>
                  <Link to="/auctions/night" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.nightSales')}
                  </Link>
                  <Link to="/auctions/bank" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.bankCars')}
                  </Link>
                  <Link to="/auctions/rental" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.rentalAuctions')}
                  </Link>
                  <Link to="/auctions/wholesale" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.wholesaleAuctions')}
                  </Link>
                  <Link to="/auctions/featured" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.featuredCars')}
                  </Link>
                </div>
              </div>

              {/* Support */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">{t('footer.support')}</h3>
                <div className="space-y-3">
                  <Link to="/help" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.helpCenter')}
                  </Link>
                  <Link to="/glossary" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.glossary')}
                  </Link>
                  <Link to="/resources" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.resourceCenter')}
                  </Link>
                  <Link to="/licensing" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.licensingHelp')}
                  </Link>
                  <Link to="/videos" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.videos')}
                  </Link>
                  <Link to="/membership" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.membershipFees')}
                  </Link>
                  <Link to="/mobile" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.mobileApps')}
                  </Link>
                  <Link to="/guide" className="block text-white/75 hover:text-blue-200 transition-colors duration-300 text-sm">
                    {t('footer.newMemberGuide')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-10 pt-8 border-t border-white/20">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <span className="text-white/75 text-sm font-medium">{t('footer.contactUs')}:</span>
                  <div className="flex items-center space-x-4">
                    <a href="#" className="text-white/75 hover:text-blue-200 transition-colors duration-300 p-2 rounded-lg hover:bg-white/10">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-white/75 hover:text-blue-200 transition-colors duration-300 p-2 rounded-lg hover:bg-white/10">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-white/75 hover:text-blue-200 transition-colors duration-300 p-2 rounded-lg hover:bg-white/10">
                      <Youtube className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-white/75 hover:text-blue-200 transition-colors duration-300 p-2 rounded-lg hover:bg-white/10">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-white/75 hover:text-blue-200 transition-colors duration-300 p-2 rounded-lg hover:bg-white/10">
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                <div className="text-white/75 text-sm">
                  {t('footer.copyright')}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Main Navigation */}
      <nav className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md border-b border-white/25 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <Gavel className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">{t('nav.logo')}</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('nav.search.placeholder')}
                    className="w-full bg-white/25 border border-white/40 rounded-xl px-4 py-2.5 text-white placeholder-blue-200 focus:bg-white/35 focus:border-blue-400 focus:outline-none transition-all duration-300 shadow-lg"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-blue-500/25"
                  >
                    {t('nav.search.button')}
              </button>
                </div>
              </form>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'az' | 'en')}
                  className="bg-white/25 border border-white/40 rounded-lg px-3 py-1.5 text-white text-sm focus:bg-white/35 focus:border-blue-400 focus:outline-none transition-all duration-300 shadow-lg"
                >
                  <option value="az" className="bg-slate-800 text-white">{t('language.azerbaijani')}</option>
                  <option value="en" className="bg-slate-800 text-white">{t('language.english')}</option>
                </select>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/25 p-2 rounded-full border border-white/40">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-white">{t('nav.welcome')} {user?.firstName || user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/75 hover:text-blue-200 transition-colors duration-300 p-2 rounded-lg hover:bg-white/10"
                  title={t('nav.logout')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <nav className="relative" style={{
        background: 'linear-gradient(to right, #0F172A, #1E3A8A, #3B82F6)',
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        borderRadius: '12px'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Role Indicator */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/50 rounded-lg px-3 py-1.5 shadow-lg">
                <span className="text-sm font-medium text-blue-200">
                  {(() => {
                    console.log('Layout - Full user object:', user);
                    console.log('Layout - User roles:', user?.user?.roles);
                    
                    const roles = user?.user?.roles;
                    if (roles && roles.length > 0) {
                      const role = roles[0]; // İlk role'ü al
                      console.log('Layout - First role:', role);
                      if (role === 'Member') return t('role.member');
                      if (role === 'Seller') return t('role.seller');
                    }
                    return t('role.member'); // Default to Member
                  })()}
                </span>
              </div>
            </div>

            {/* Main Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-white hover:text-gray-100 transition-all duration-250 ease-in-out text-sm font-medium px-3 py-1 rounded-xl hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400" style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
              }}>
                {t('menu.dashboard')}
              </Link>
              
              {/* Inventory Dropdown */}
              <div className="relative group">
                <button className="flex items-center text-white hover:text-gray-100 transition-all duration-250 ease-in-out text-sm font-medium px-3 py-1 rounded-xl hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400" style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                }}>
                  {t('menu.inventory')}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-52 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-250 ease-in-out" style={{
                  background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(30, 58, 138, 0.8), rgba(59, 130, 246, 0.8))',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="py-2">
                    <Link to="/vehicle-finder" className="block px-4 py-2.5 text-sm text-white hover:text-gray-100 transition-all duration-250 ease-in-out hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400 relative group" style={{
                      borderRadius: '10px',
                      margin: '2px 8px'
                    }}>
                      {t('dropdown.vehicleFinder')}
                    </Link>
                    <Link to="/sales-list" className="block px-4 py-2.5 text-sm text-white hover:text-gray-100 transition-all duration-250 ease-in-out hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400 relative group" style={{
                      borderRadius: '10px',
                      margin: '2px 8px'
                    }}>
                      {t('dropdown.salesList')}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Auctions Dropdown */}
              <div className="relative group">
                <button className="flex items-center text-white hover:text-gray-100 transition-all duration-250 ease-in-out text-sm font-medium px-3 py-1 rounded-xl hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400" style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                }}>
                  {t('menu.auctions')}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-52 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-250 ease-in-out" style={{
                  background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(30, 58, 138, 0.8), rgba(59, 130, 246, 0.8))',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="py-2">
                    <Link to="/auctions/today" className="block px-4 py-2.5 text-sm text-white hover:text-gray-100 transition-all duration-250 ease-in-out hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400 relative group" style={{
                      borderRadius: '10px',
                      margin: '2px 8px'
                    }}>
                      {t('dropdown.todaysAuction')}
                    </Link>
                    <Link to="/auctions/calendar" className="block px-4 py-2.5 text-sm text-white hover:text-gray-100 transition-all duration-250 ease-in-out hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400 relative group" style={{
                      borderRadius: '10px',
                      margin: '2px 8px'
                    }}>
                      {t('dropdown.auctionsCalendar')}
                    </Link>
                    <Link to="/auctions/join" className="block px-4 py-2.5 text-sm text-white hover:text-gray-100 transition-all duration-250 ease-in-out hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400 relative group" style={{
                      borderRadius: '10px',
                      margin: '2px 8px'
                    }}>
                      {t('dropdown.joinAuction')}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bids Dropdown */}
              <div className="relative group">
                <button className="flex items-center text-white hover:text-gray-100 transition-all duration-250 ease-in-out text-sm font-medium px-3 py-1 rounded-xl hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400" style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                }}>
                  {t('menu.bids')}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-52 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-250 ease-in-out" style={{
                  background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(30, 58, 138, 0.8), rgba(59, 130, 246, 0.8))',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="py-2">
                    <Link to="/my-bids" className="block px-4 py-2.5 text-sm text-white hover:text-gray-100 transition-all duration-250 ease-in-out hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400 relative group" style={{
                      borderRadius: '10px',
                      margin: '2px 8px'
                    }}>
                      {t('dropdown.myBids')}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <Link to="/payment" className="text-white hover:text-gray-100 transition-all duration-250 ease-in-out text-sm font-medium px-3 py-1 rounded-xl hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400" style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
              }}>
                {t('menu.payment')}
              </Link>

              {/* Add Advertisement (Only for Sellers) */}
              {(() => {
                const roles = user?.user?.roles;
                const isSeller = roles && roles.includes('Seller');
                return isSeller && (
                  <Link to="/add-advertisement" className="flex items-center text-white hover:text-gray-100 transition-all duration-250 ease-in-out text-sm font-medium px-3 py-1 rounded-xl hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400" style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                  }}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t('menu.addAdvertisement')}
                  </Link>
                );
              })()}

              {/* Locations */}
              <Link to="/locations" className="text-white hover:text-gray-100 transition-all duration-250 ease-in-out text-sm font-medium px-3 py-1 rounded-xl hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400" style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
              }}>
                {t('menu.locations')}
              </Link>

              {/* Services & Support Dropdown */}
              <div className="relative group">
                <button className="flex items-center text-white hover:text-gray-100 transition-all duration-250 ease-in-out text-sm font-medium px-3 py-1 rounded-xl hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400" style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                }}>
                  {t('menu.services')}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-52 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-250 ease-in-out" style={{
                  background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(30, 58, 138, 0.8), rgba(59, 130, 246, 0.8))',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="py-2">
                    <Link to="/about" className="block px-4 py-2.5 text-sm text-white hover:text-gray-100 transition-all duration-250 ease-in-out hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400 relative group" style={{
                      borderRadius: '10px',
                      margin: '2px 8px'
                    }}>
                      {t('dropdown.aboutUs')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/85 hover:text-blue-200 transition-colors duration-300 p-2 rounded-lg hover:bg-white/10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative mt-auto overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0F172A, #1E3A8A, #3B82F6)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
      }}>
        {/* Radial Glow Effect */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-32 opacity-20" style={{
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          filter: 'blur(20px)'
        }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Logo and Language */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
                    <Gavel className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">{t('nav.logo')}</span>
                </div>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'az' | 'en')}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:bg-white/20 focus:border-blue-400 focus:outline-none transition-all duration-300 w-full shadow-lg backdrop-blur-sm"
                  >
                    <option value="az" className="bg-slate-800 text-white">{t('language.azerbaijani')}</option>
                    <option value="en" className="bg-slate-800 text-white">{t('language.english')}</option>
                  </select>
                </div>
              </div>

            {/* Get to Know Us */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">{t('footer.getToKnowUs')}</h3>
              <div className="space-y-3">
                <Link to="/about" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.aboutUs')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/careers" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.careers')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/news" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.news')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </div>

            {/* Auctions */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">{t('footer.auctions')}</h3>
              <div className="space-y-3">
                <Link to="/auctions/today" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.todaysAuctions')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/auctions/calendar" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.auctionsCalendar')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/auctions/join" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.joinAuction')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/auctions/night" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.nightSales')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/auctions/bank" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.bankCars')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/auctions/rental" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.rentalAuctions')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/auctions/wholesale" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.wholesaleAuctions')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/auctions/featured" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.featuredCars')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
                </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">{t('footer.support')}</h3>
              <div className="space-y-3">
                <Link to="/help" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.helpCenter')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/glossary" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.glossary')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/resources" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.resourceCenter')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/licensing" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.licensingHelp')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/videos" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.videos')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/membership" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.membershipFees')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/mobile" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.mobileApps')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/guide" className="block text-slate-300 hover:text-blue-500 transition-all duration-300 text-sm relative group">
                  {t('footer.newMemberGuide')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="mt-10 pt-8 border-t border-white/20 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-slate-300 text-sm font-medium">{t('footer.contactUs')}:</span>
                  <div className="flex items-center space-x-4">
                    <a href="#" className="text-slate-400 hover:text-blue-500 transition-all duration-300 p-2 rounded-lg hover:bg-white/10 transform hover:scale-110">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-blue-500 transition-all duration-300 p-2 rounded-lg hover:bg-white/10 transform hover:scale-110">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-blue-500 transition-all duration-300 p-2 rounded-lg hover:bg-white/10 transform hover:scale-110">
                      <Youtube className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-blue-500 transition-all duration-300 p-2 rounded-lg hover:bg-white/10 transform hover:scale-110">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-blue-500 transition-all duration-300 p-2 rounded-lg hover:bg-white/10 transform hover:scale-110">
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  </div>
              </div>
              <div className="text-slate-300 text-sm">
                {t('footer.copyright')}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}