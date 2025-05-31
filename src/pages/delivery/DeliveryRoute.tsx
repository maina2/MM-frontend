import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { usePostOptimizeRouteMutation } from '../../api/apiSlice';

// Define props
interface DeliveryRouteProps {
  deliveryIds: number[];
  startLocation?: [number, number]; // Optional, defaults to Nairobi CBD
}

// Custom icons
const startIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
const deliveryIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const DeliveryRoute: React.FC<DeliveryRouteProps> = ({ deliveryIds, startLocation = [-1.2833, 36.8167] }) => {
  const [optimizeRoute, { data, isLoading, error, isUninitialized }] = usePostOptimizeRouteMutation();

  // Memoize props to prevent unnecessary re-renders
  const stableDeliveryIds = useMemo(() => [...deliveryIds].sort(), [deliveryIds]);
  const stableStartLocation = useMemo(() => [...startLocation], [startLocation]);

  // Fetch route only once or when props change
  useEffect(() => {
    if (stableDeliveryIds.length > 0 && isUninitialized) {
      const timer = setTimeout(() => {
        optimizeRoute({
          start_location: stableStartLocation,
          delivery_ids: stableDeliveryIds,
        });
      }, 500); // Debounce by 500ms
      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [stableDeliveryIds, stableStartLocation, isUninitialized]);

  // Map center
  const mapCenter: [number, number] = stableStartLocation;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading delivery route...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = (error as any).data?.error || 'Failed to load route';
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 max-w-md w-full text-center">
          <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Route</h3>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => optimizeRoute({ start_location: stableStartLocation, delivery_ids: stableDeliveryIds })}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No route data
  if (!data?.optimized_route || data.optimized_route.length === 0) {
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5-5m0 0l5-5m-5 5h16" />
          </svg>
          <p className="text-gray-600 font-medium">No route available</p>
        </div>
      </div>
    );
  }

  // Route points
  const routePoints = data.optimized_route.map(([lat, lng]) => [lat, lng] as [number, number]);

  // Markers
  const markers = data.optimized_route.map((point, index) => ({
    position: point as [number, number],
    label: index === 0 ? 'Start (Warehouse)' : index === data.optimized_route.length - 1 ? 'Return to Warehouse' : `Delivery #${stableDeliveryIds[index - 1] || index}`,
    isStart: index === 0 || index === data.optimized_route.length - 1,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-7xl mx-auto my-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Optimized Route</h3>
      </div>
      <div className="p-4">
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="h-[600px] w-full rounded-xl border-2 border-blue-200"
          aria-label="Delivery route map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Polyline positions={routePoints} pathOptions={{ color: '#2563eb', weight: 4 }} />
          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              position={marker.position}
              icon={marker.isStart ? startIcon : deliveryIcon}
              keyboard={true}
            >
              <Popup>
                <div className="text-sm font-medium text-gray-900">{marker.label}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default DeliveryRoute;