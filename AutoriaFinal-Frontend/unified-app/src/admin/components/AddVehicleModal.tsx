import { useState, useEffect } from 'react'
import { X, Search, Filter, Check, Car, AlertCircle } from 'lucide-react'
import { apiClient } from '../services/apiClient'

interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  odometer: number
  odometerUnit: string
  condition: string
  damageType: string
  ownerName: string
  locationName: string
  status: string
  thumbnailUrl?: string
  images?: string[]
  description?: string
  price?: number
}

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onAddVehicles: (vehicles: Vehicle[]) => void
}

export function AddVehicleModal({ isOpen, onClose, onAddVehicles }: AddVehicleModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('multiple')

  useEffect(() => {
    if (isOpen) {
      loadVehicles()
    }
  }, [isOpen])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use GET /api/car with pagination for Add Vehicle modal
      const response = await apiClient.getVehicles({
        page: 1,
        pageSize: 50,
        search: searchTerm
      })
      
      if (response && response.items) {
        setVehicles(response.items)
      } else {
        setVehicles([])
      }
    } catch (err: any) {
      console.error('Error loading vehicles for auction:', err)
      setError(err.message || 'Failed to load vehicles')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const handleVehicleSelect = (vehicleId: string) => {
    const newSelection = new Set(selectedVehicles)
    
    if (selectionMode === 'single') {
      newSelection.clear()
      newSelection.add(vehicleId)
    } else {
      if (newSelection.has(vehicleId)) {
        newSelection.delete(vehicleId)
      } else {
        newSelection.add(vehicleId)
      }
    }
    
    setSelectedVehicles(newSelection)
  }

  const handleAddSelected = () => {
    const selected = vehicles.filter(v => selectedVehicles.has(v.id))
    onAddVehicles(selected)
    setSelectedVehicles(new Set())
    onClose()
  }

  const handleSearch = () => {
    loadVehicles()
  }

  const getVehicleImageUrl = (vehicle: Vehicle): string | null => {
    return apiClient.parseImageUrl(vehicle.images?.join(';'), vehicle.thumbnailUrl)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'inauction':
      case 'in auction':
        return 'bg-blue-100 text-blue-800'
      case 'sold':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Car className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Add Vehicles to Auction</h3>
            <span className="text-sm text-gray-500">
              ({selectedVehicles.size} selected)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by VIN, make, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Search
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectionMode('single')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectionMode === 'single' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Single
              </button>
              <button
                onClick={() => setSelectionMode('multiple')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectionMode === 'multiple' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Multiple
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading vehicles...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading vehicles</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button 
                  onClick={loadVehicles}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'No vehicles available for auction.'}
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => {
                      setSearchTerm('')
                      loadVehicles()
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((vehicle) => {
                  const isSelected = selectedVehicles.has(vehicle.id)
                  const imageUrl = getVehicleImageUrl(vehicle)
                  
                  return (
                    <div
                      key={vehicle.id}
                      className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => handleVehicleSelect(vehicle.id)}
                    >
                      {/* Vehicle Image */}
                      <div className="h-32 bg-gray-200 rounded-t-lg relative overflow-hidden">
                        {imageUrl ? (
                          <img 
                            src={imageUrl}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Car className="w-8 h-8" />
                          </div>
                        )}
                        
                        {/* Selection Indicator */}
                        <div className="absolute top-2 right-2">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'bg-white border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Vehicle Info */}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          VIN: {vehicle.vin?.slice(0, 8)}...
                        </p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div>{vehicle.odometer?.toLocaleString()} {vehicle.odometerUnit || 'miles'}</div>
                          <div>{vehicle.ownerName || 'Unknown Owner'}</div>
                          <div>{vehicle.locationName || 'Unknown Location'}</div>
                        </div>
                        
                        {/* Not marked for auction warning */}
                        {vehicle.status !== 'Available' && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            Not marked for auction
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedVehicles.size} vehicle{selectedVehicles.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedVehicles.size === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Selected Vehicles
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
