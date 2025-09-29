import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  List,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { AuctionGetDto } from '../types/api';

interface AuctionWithLocation extends AuctionGetDto {
  location?: any; // Using any since LocationGetDto doesn't exist
  status: 'live' | 'ended' | 'upcoming';
  timeSlot: string;
  daysUntilAuction?: number;
  startTime?: Date;
  endTime?: Date;
}

interface CalendarCell {
  timeSlot: string;
  day: string;
  date: string;
  auctions: AuctionWithLocation[];
}

const AuctionCalendar: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<AuctionWithLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [regions, setRegions] = useState<string[]>([]);
  const [hoveredCell, setHoveredCell] = useState<{ timeSlot: string; day: string } | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Time slots for the calendar
  const timeSlots = [
    '05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
    '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'
  ];

  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing auction calendar data...');
      loadData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Refresh data when currentWeek changes
  useEffect(() => {
    if (auctions.length > 0) {
      // Re-process auctions for the new week/month
      console.log('Re-processing auctions for new period:', currentWeek);
    }
  }, [currentWeek, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading auction calendar data from API...');
      
      // Load locations and auctions in parallel
      const [locationsData, auctionsData] = await Promise.all([
        apiClient.getLocations(),
        apiClient.getAuctions()
      ]);
      
      console.log('Locations loaded:', locationsData);
      console.log('Auctions loaded:', auctionsData);
      
      setLocations(locationsData);
      
      // Extract unique regions from locations
      const uniqueRegions = [...new Set(locationsData.map(loc => loc.region).filter(Boolean))];
      setRegions(['All', ...uniqueRegions]);
      console.log('Available regions:', uniqueRegions);
      
      // Process auctions with enhanced data
      const processedAuctions = auctionsData.map(auction => {
        const location = locationsData.find(loc => loc.id === auction.locationId);
        const now = new Date();
        const startTime = new Date(auction.startTimeUtc);
        const endTime = new Date(auction.endTimeUtc);
        
        // Determine auction status
        let status: 'live' | 'ended' | 'upcoming' = 'upcoming';
        if (now >= startTime && now <= endTime) {
          status = 'live';
        } else if (now > endTime) {
          status = 'ended';
        }
        
        // Get time slot based on start time
        const timeSlot = getTimeSlot(startTime);
        
        // Calculate days until auction
        const daysUntilAuction = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...auction,
          location,
          status,
          timeSlot,
          daysUntilAuction,
          startTime,
          endTime
        };
      });
      
      // Sort auctions by start time
      processedAuctions.sort((a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime());
      
      setAuctions(processedAuctions);
      console.log('Processed auctions:', processedAuctions);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      // Set empty arrays on error
      setLocations([]);
      setAuctions([]);
      setRegions(['All']);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlot = (date: Date): string => {
    const hours = date.getHours();
    
    // Find the closest time slot
    const timeSlotIndex = timeSlots.findIndex(slot => {
      const slotTime = new Date();
      const [time, period] = slot.split(' ');
      const [hour, minute] = time.split(':');
      slotTime.setHours(parseInt(hour) + (period === 'PM' && hour !== '12' ? 12 : 0));
      slotTime.setMinutes(parseInt(minute));
      
      return slotTime.getHours() >= hours;
    });
    
    return timeSlotIndex >= 0 ? timeSlots[timeSlotIndex] : timeSlots[0];
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
  };

  // Calendar navigation functions
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentWeek);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentWeek(newMonth);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    startOfWeek.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDate);
    }
    return weekDates;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday
    
    const dates = [];
    const current = new Date(startDate);
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // End on Sunday
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const getCalendarCells = (): CalendarCell[] => {
    const weekDates = viewMode === 'week' ? getWeekDates(currentWeek) : getCurrentWeekDates();
    const cells: CalendarCell[] = [];
    
    timeSlots.forEach(timeSlot => {
      daysOfWeek.forEach((day, dayIndex) => {
        const date = weekDates[dayIndex];
        const dateString = date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        // Filter auctions for this time slot and day
        const dayAuctions = auctions.filter(auction => {
          if (!auction.location) return false;
          
          const auctionDate = new Date(auction.startTimeUtc);
          const isSameDay = auctionDate.toDateString() === date.toDateString();
          const isSameTimeSlot = auction.timeSlot === timeSlot;
          
          // Apply filters
          const matchesRegion = selectedRegion === 'All' || auction.location.region === selectedRegion;
          const matchesCity = cityFilter === '' || 
            auction.location.city.toLowerCase().includes(cityFilter.toLowerCase());
          const matchesStatus = !showOnlyActive || auction.status === 'live';
          
          return isSameDay && isSameTimeSlot && matchesRegion && matchesCity && matchesStatus;
        });
        
        cells.push({
          timeSlot,
          day,
          date: dateString,
          auctions: dayAuctions
        });
      });
    });
    
    return cells;
  };

  const getStatusIcon = (status: 'live' | 'ended' | 'upcoming') => {
    switch (status) {
      case 'live':
        return <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>;
      case 'ended':
        return <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>;
      case 'upcoming':
        return <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>;
      default:
        return <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>;
    }
  };

  const getStatusColor = (status: 'live' | 'ended' | 'upcoming') => {
    switch (status) {
      case 'live':
        return 'text-green-600';
      case 'ended':
        return 'text-red-600';
      case 'upcoming':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calendarCells = getCalendarCells();
  const weekDates = getCurrentWeekDates();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading auction calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Auction Calendar</h1>
              <p className="text-gray-600 mt-2">
                {viewMode === 'week' ? 'Weekly' : 'Monthly'} auction schedule by location and time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/todays-auctions"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <List className="h-4 w-4" />
                Today's Auctions
              </Link>
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Calendar Navigation */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'week'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'month'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Month
                  </button>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={`Previous ${viewMode}`}
                  >
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Today
                  </button>
                  
                  <button
                    onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={`Next ${viewMode}`}
                  >
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Current Period Display */}
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {viewMode === 'week' 
                    ? `${getWeekDates(currentWeek)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getWeekDates(currentWeek)[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {auctions.length} auction{auctions.length !== 1 ? 's' : ''} scheduled
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Calendar */}
          <div className="flex-1">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Region Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="text"
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      placeholder="Search by city..."
                      className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showOnlyActive}
                      onChange={(e) => setShowOnlyActive(e.target.checked)}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-700">Show only active auctions</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  {/* Header */}
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
                      <th className="px-2 py-2 text-left text-xs font-medium w-20">
                        Time
                      </th>
                      {daysOfWeek.map((day, index) => (
                        <th key={day} className="px-2 py-2 text-center text-xs font-medium min-w-32">
                          <div>
                            <div className="font-semibold text-xs">{day}</div>
                            <div className="text-xs opacity-90 mt-0.5">
                              {weekDates[index].toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody>
                    {timeSlots.map((timeSlot, timeIndex) => (
                      <tr key={timeSlot} className={timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {/* Time Column */}
                        <td className="px-2 py-2 text-xs font-medium text-gray-900 bg-gray-100 sticky left-0 z-10">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            {timeSlot}
                          </div>
                        </td>

                        {/* Day Columns */}
                        {daysOfWeek.map((day) => {
                          const cell = calendarCells.find(
                            c => c.timeSlot === timeSlot && c.day === day
                          );
                          
                          return (
                            <td
                              key={`${timeSlot}-${day}`}
                              className="px-2 py-2 text-xs border-r border-gray-200 min-w-32"
                              onMouseEnter={() => setHoveredCell({ timeSlot, day })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              {cell && cell.auctions.length > 0 ? (
                                <div className="space-y-1">
                                  {cell.auctions.map((auction, auctionIndex) => (
                                    <div key={`${auction.id}-${auctionIndex}`} className="group">
                                      <Link
                                        to={`/auctions/${auction.id}/cars`}
                                        className="block p-1 rounded hover:bg-blue-50 transition-colors"
                                      >
                                        <div className="flex items-start gap-1">
                                          {getStatusIcon(auction.status)}
                                          <div className="flex-1 min-w-0">
                                            <div className={`font-medium text-xs ${getStatusColor(auction.status)} truncate`}>
                                              {auction.location?.city || 'Unknown City'}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                              {auction.location?.addressLine1 || 'No address'}
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <div className="text-xs text-gray-400">
                                                {auction.location?.region || 'Unknown Region'}
                                              </div>
                                              {auction.status === 'live' && (
                                                <div className="text-xs text-green-600 font-medium">
                                                  LIVE
                                                </div>
                                              )}
                                              {auction.status === 'upcoming' && auction.daysUntilAuction !== undefined && (
                                                <div className="text-xs text-blue-600">
                                                  {auction.daysUntilAuction === 0 ? 'Today' : 
                                                   auction.daysUntilAuction === 1 ? 'Tomorrow' : 
                                                   `${auction.daysUntilAuction}d`}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                      
                                      {/* Enhanced Tooltip */}
                                      {hoveredCell?.timeSlot === timeSlot && hoveredCell?.day === day && (
                                        <div className="absolute z-20 mt-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
                                          <div className="font-medium">{auction.location?.city}</div>
                                          <div className="text-gray-300">{auction.location?.addressLine1}</div>
                                          <div className="text-gray-300">{auction.location?.region}</div>
                                          <div className="mt-2 space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-gray-400">Status:</span>
                                              <span className={`font-medium ${
                                                auction.status === 'live' ? 'text-green-400' :
                                                auction.status === 'ended' ? 'text-red-400' :
                                                'text-blue-400'
                                              }`}>
                                                {auction.status === 'live' ? '🔴 LIVE' :
                                                 auction.status === 'ended' ? '⏹️ ENDED' :
                                                 '⏰ UPCOMING'}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-gray-400">Start:</span>
                                              <span className="text-white">{formatTime(auction.startTimeUtc)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-gray-400">End:</span>
                                              <span className="text-white">{formatTime(auction.endTimeUtc)}</span>
                                            </div>
                                            {auction.status === 'upcoming' && auction.daysUntilAuction !== undefined && (
                                              <div className="flex items-center gap-2">
                                                <span className="text-gray-400">In:</span>
                                                <span className="text-blue-400 font-medium">
                                                  {auction.daysUntilAuction === 0 ? 'Today' : 
                                                   auction.daysUntilAuction === 1 ? 'Tomorrow' : 
                                                   `${auction.daysUntilAuction} days`}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-xs text-center py-1">
                                  No auctions
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <h3 className="text-xs font-medium text-gray-900 mb-2">Status Legend</h3>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Live Auctions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Ended Auctions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600">Upcoming Auctions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - About Section */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Auction Calendar</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  The Auction Calendar provides a comprehensive view of all scheduled auctions 
                  organized by time and location. Each cell shows auctions happening at specific 
                  times and days.
                </p>
                <p>
                  Use the filters to narrow down by region, city, or auction status. 
                  Click on any auction to view its vehicle inventory.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Features:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Weekly auction schedule</li>
                    <li>• Real-time status indicators</li>
                    <li>• Location-based filtering</li>
                    <li>• Interactive tooltips</li>
                    <li>• Direct auction access</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Status Colors:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• <span className="text-green-600">●</span> Live - Currently active</li>
                    <li>• <span className="text-red-600">●</span> Ended - Completed</li>
                    <li>• <span className="text-gray-600">●</span> Upcoming - Scheduled</li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/todays-auctions"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Today's Auctions →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionCalendar;
