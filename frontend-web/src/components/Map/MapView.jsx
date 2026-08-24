import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export const MapView = ({ listings, userLocation }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 relative overflow-hidden h-96 flex flex-col justify-between shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 opacity-90"></div>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="relative z-10 flex justify-between items-center bg-slate-900/80 backdrop-blur p-3 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-2 text-emerald-400 font-medium text-sm">
          <Navigation className="h-4 w-4 animate-pulse" />
          <span>Location Radar Active ({listings.length} Nearby Pins)</span>
        </div>
        <span className="text-xs text-slate-400">Lat: {userLocation?.latitude || 12.9716}, Lon: {userLocation?.longitude || 77.5946}</span>
      </div>

      <div className="relative z-10 my-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
        {listings.slice(0, 6).map((item) => (
          <div key={item.id} className="bg-slate-950/90 border border-emerald-500/30 rounded p-2 text-xs backdrop-blur hover:border-emerald-400 transition">
            <div className="flex items-center space-x-1 text-emerald-400 font-bold truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{item.title}</span>
            </div>
            <div className="text-slate-300 mt-1 flex justify-between">
              <span>₹{item.price}/{item.unit}</span>
              {item.distance_km !== undefined && <span className="text-emerald-400">{item.distance_km} km</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center text-xs text-slate-500 pt-2 border-t border-slate-800/50">
        Interactive Map discovery overlay integrated with Google Maps API backend.
      </div>
    </div>
  );
};
