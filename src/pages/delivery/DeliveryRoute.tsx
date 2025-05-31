// src/components/DeliveryRoute.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { usePostOptimizeRouteMutation, useGetDeliveryTasksQuery } from '../../api/apiSlice';
import { Delivery, OptimizeRouteRequest, OptimizeRouteResponse } from '../../types';
import { AlertCircle, MapPin } from 'lucide-react';

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

const DeliveryRoute: React.FC = () => {
  const [startLocation, setStartLocation] = useState<[number, number]>([-1.2833, 36.8167]); // Default: Nairobi CBD
  const [geoStatus, setGeoStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [optimizeRoute, { data, isLoading: isRouteLoading, error: routeError }] = usePostOptimizeRouteMutation();
  const { data: deliveryData, isLoading: isDeliveriesLoading, error: deliveriesError } = useGetDeliveryTasksQuery({
    page: 1,
    page_size: 100,
  });

  // Extract delivery IDs
  const deliveryIds = useMemo(() => {
    const ids = deliveryData?.results
      ?.filter((delivery: Delivery) => delivery.status === 'assigned' || delivery.status === 'in_transit')
      .map((delivery: Delivery) => delivery.id) || [];
    console.log('[DeliveryRoute] Delivery IDs:', ids);
    return ids;
  }, [deliveryData]);

  // Fetch user location
  const fetchGeolocation = useCallback(() => {
    console.log('[DeliveryRoute] Attempting geolocation');
    setGeoStatus('pending');
    setGeoError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[DeliveryRoute] Geolocation success:', position.coords);
          setStartLocation([position.coords.latitude, position.coords.longitude]);
          setGeoStatus('success');
        },
        (err) => {
          console.warn('[DeliveryRoute] Geolocation failed:', err.message, { code: err.code });
          setGeoStatus('failed');
          setGeoError(err.message || 'Unable to access location.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      console.warn('[DeliveryRoute] Geolocation not supported');
      setGeoStatus('failed');
      setGeoError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Initial geolocation attempt
  useEffect(() => {
    fetchGeolocation();
  }, [fetchGeolocation]);

  // Fetch route
  useEffect(() => {
    if (deliveryIds.length > 0 && geoStatus === 'success' && !isRouteLoading && !data && !routeError) {
      console.log('[DeliveryRoute] Fetching route with startLocation:', startLocation, 'deliveryIds:', deliveryIds);
      const timer = setTimeout(() => {
        optimizeRoute({ start_location: startLocation, delivery_ids: deliveryIds } as OptimizeRouteRequest);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [deliveryIds, startLocation, geoStatus, optimizeRoute, isRouteLoading, data, routeError]);

  // Loading state
  if (isDeliveriesLoading || (isRouteLoading && geoStatus === 'success')) {
    console.log('[DeliveryRoute] Rendering loading state');
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading delivery route...</p>
        </div>
      </div>
    );
  }

  // Geolocation failure state
  if (geoStatus === 'failed') {
    console.log('[DeliveryRoute] Rendering geolocation failure state:', geoError);
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Access Location</h3>
          <p className="text-gray-600 mb-4">
            {geoError || 'Unable to access your location. You can retry or use the default location (Nairobi CBD).'}
          </p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => fetchGeolocation()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Retry Location
            </button>
            <button
              onClick={() => {
                console.log('[DeliveryRoute] User chose default location');
                setGeoStatus('success');
              }}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all"
            >
              Use Default Location (Nairobi CBD)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // API error state
  if (routeError || deliveriesError) {
    const errorMessage = (routeError as any)?.data?.error || (deliveriesError as any)?.data?.error || 'Failed to load route';
    console.log('[DeliveryRoute] Rendering API error state:', errorMessage);
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 max-w-md w-full text-center">
          <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Route</h3>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => optimizeRoute({ start_location: startLocation, delivery_ids: deliveryIds })}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No route data
  if (!data?.optimized_route || data.optimized_route.length === 0 || deliveryIds.length === 0) {
    console.log('[DeliveryRoute] Rendering no route state:', { optimizedRoute: data?.optimized_route, deliveryIds });
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
  const routePoints = data.optimized_route.map((point) => [point.lat, point.lng] as [number, number]);
  console.log('[DeliveryRoute] Rendering route with points:', routePoints);

  // Markers
  const markers = data.optimized_route.map((point, index) => ({
    position: [point.lat, point.lng] as [number, number],
    label: index === 0 ? 'Start (You)' : index === data.optimized_route.length - 1 ? 'Return to Start' : `Delivery #${point.delivery_id || index}`,
    isStart: index === 0 || index === data.optimized_route.length - 1,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-7xl mx-auto my-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Optimized Delivery Route</h3>
      </div>
      <div className="p-4">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-800">
            Starting from: {startLocation[0].toFixed(4)}, {startLocation[1].toFixed(4)}
          </p>
        </div>
        <MapContainer
          center={startLocation}
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