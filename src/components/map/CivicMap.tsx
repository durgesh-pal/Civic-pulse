import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Issue, IssueCategory, IssuePriority, IssueStatus } from '../../types';
import { MapPin, Navigation, Layers, Filter } from 'lucide-react';
import { CIVIC_CATEGORIES } from '../../lib/constants';

interface CivicMapProps {
  issues?: Issue[];
  selectedIssueId?: string;
  onSelectIssue?: (issue: Issue) => void;
  // Picker mode for Report Issue flow
  pickerMode?: boolean;
  selectedLocation?: { lat: number; lng: number };
  onLocationPick?: (coords: { lat: number; lng: number }) => void;
  heightClass?: string;
  showFilters?: boolean;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  issues = [],
  selectedIssueId,
  onSelectIssue,
  pickerMode = false,
  selectedLocation,
  onLocationPick,
  heightClass = 'h-[500px]',
  showFilters = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Center around Bengaluru by default
  const defaultCenter: [number, number] = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : issues.length > 0
    ? [issues[0].location.lat, issues[0].location.lng]
    : [12.9716, 77.5946];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // In picker mode, listen to map clicks
      if (pickerMode && onLocationPick) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onLocationPick({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }
    }

    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update picker marker when in picker mode
  useEffect(() => {
    if (!pickerMode || !mapInstanceRef.current || !selectedLocation) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
    } else {
      const pinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="background-color: #2563eb; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); animation: bounce 1s infinite alternate;">
            <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(mapInstanceRef.current);

      marker.on('dragend', (e) => {
        const latlng = (e.target as L.Marker).getLatLng();
        onLocationPick?.({ lat: latlng.lat, lng: latlng.lng });
      });

      pickerMarkerRef.current = marker;
    }

    mapInstanceRef.current.panTo([selectedLocation.lat, selectedLocation.lng]);
  }, [selectedLocation, pickerMode]);

  // Update markers when issues or filters change
  useEffect(() => {
    if (pickerMode || !mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = issues.filter((issue) => {
      if (categoryFilter !== 'All' && issue.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && issue.priority !== priorityFilter) return false;
      if (statusFilter !== 'All' && issue.status !== statusFilter) return false;
      return true;
    });

    filtered.forEach((issue) => {
      const color =
        issue.status === 'Resolved'
          ? '#059669'
          : issue.priority === 'Critical'
          ? '#dc2626'
          : issue.priority === 'High'
          ? '#ea580c'
          : issue.priority === 'Medium'
          ? '#d97706'
          : '#2563eb';

      const customIcon = L.divIcon({
        className: 'civic-map-marker',
        html: `
          <div style="
            background-color: ${color};
            width: ${selectedIssueId === issue.id ? '36px' : '26px'};
            height: ${selectedIssueId === issue.id ? '36px' : '26px'};
            border-radius: 50%;
            border: 2.5px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${issue.upvotes > 0 ? issue.upvotes : '•'}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([issue.location.lat, issue.location.lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; width: 220px; padding: 2px;">
          <img src="${issue.beforeImage}" alt="${issue.title}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <div style="font-size: 10px; font-weight: 700; color: ${color}; text-transform: uppercase; margin-bottom: 2px;">
            ${issue.category} • ${issue.priority} Priority
          </div>
          <div style="font-weight: 700; font-size: 12px; color: #0f172a; margin-bottom: 4px; line-height: 1.3;">
            ${issue.title}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px; line-height: 1.2;">
            📍 ${issue.location.address}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 11px;">
            <span style="font-weight: 600; color: #334155;">Status: <strong>${issue.status}</strong></span>
            <span style="color: #2563eb; font-weight: 700;">👍 ${issue.upvotes} upvotes</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectIssue?.(issue);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [issues, categoryFilter, priorityFilter, statusFilter, selectedIssueId, pickerMode]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          mapInstanceRef.current?.setView([lat, lng], 15);
          if (pickerMode && onLocationPick) {
            onLocationPick({ lat, lng });
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
        }
      );
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-sm`}>
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Filter Bar */}
      {showFilters && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur p-2.5 rounded-xl border border-slate-200 shadow-lg flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-bold pr-2 border-r border-slate-200">
            <Filter className="w-3.5 h-3.5" />
            <span>Map Layers</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-blue-500"
          >
            <option value="All">All Categories</option>
            {CIVIC_CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">🔴 Critical Only</option>
            <option value="High">🟠 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="In Progress">In Progress</option>
            <option value="Assigned">Assigned</option>
            <option value="Resolved">Resolved Only</option>
          </select>
        </div>
      )}

      {/* Floating GPS Button */}
      <button
        onClick={handleGetCurrentLocation}
        className="absolute bottom-4 left-4 z-[1000] bg-white hover:bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200 shadow-md font-medium text-xs flex items-center gap-1.5 transition active:scale-95"
        title="Find My Location"
      >
        <Navigation className="w-4 h-4 text-blue-600" />
        <span className="hidden sm:inline">My GPS Location</span>
      </button>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-14 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hidden md:flex items-center gap-3 text-[11px] font-semibold text-slate-600">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Critical
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> High
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Resolved
        </span>
      </div>
    </div>
  );
};
