import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Academy, Child } from '../types';
import { getDistanceMeters, formatDistance } from '../utils/geo';
import { 
  Navigation, 
  MapPin, 
  LocateFixed, 
  Crosshair, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Play,
  RotateCcw,
  Footprints,
  Maximize2,
  Minimize2,
  ShieldCheck
} from 'lucide-react';

interface GeofenceMapProps {
  child: Child;
  academies: Academy[];
  selectedAcademyId: string | null;
  onSelectAcademy: (academyId: string) => void;
  onUpdateChildLocation: (lat: number, lng: number, address?: string) => void;
}

export const GeofenceMap: React.FC<GeofenceMapProps> = ({
  child,
  academies,
  selectedAcademyId,
  onSelectAcademy,
  onUpdateChildLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const childMarkerRef = useRef<L.Marker | null>(null);
  const academyMarkersRef = useRef<{ [id: string]: { marker: L.Marker; circle: L.Circle } }>({});

  const [mapReady, setMapReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  // Calculate distances to all academies
  const academyDistances = academies.map((acad) => {
    const distance = getDistanceMeters(
      child.currentLocation.lat,
      child.currentLocation.lng,
      acad.lat,
      acad.lng
    );
    const isInside = distance <= acad.geofenceRadius;
    return {
      academy: acad,
      distance,
      isInside,
    };
  });

  // Nearest academy
  const nearest = [...academyDistances].sort((a, b) => a.distance - b.distance)[0];
  const targetAcad = academies.find((a) => a.id === selectedAcademyId) || nearest?.academy || academies[0];

  // Initialize map with tighter zoom for 10m precision
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [child.currentLocation.lat, child.currentLocation.lng],
        zoom: 17,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        onUpdateChildLocation(
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6)),
          '지도 터치 지정 위치'
        );
      });

      mapInstanceRef.current = map;
      setMapReady(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle resize when expanding / shrinking map
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isExpanded]);

  // Sync child marker
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    const childIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 bg-indigo-500/20 rounded-full animate-ping"></div>
        <div class="relative w-8 h-8 rounded-full border-2 border-white bg-indigo-600 shadow-md flex items-center justify-center overflow-hidden">
          <img src="${child.avatar}" class="w-full h-full object-cover" />
        </div>
        <div class="absolute -bottom-4 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
          ${child.name}
        </div>
      </div>
    `;

    const customChildIcon = L.divIcon({
      html: childIconHtml,
      className: 'custom-child-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (childMarkerRef.current) {
      childMarkerRef.current.setLatLng([child.currentLocation.lat, child.currentLocation.lng]);
    } else {
      const marker = L.marker([child.currentLocation.lat, child.currentLocation.lng], {
        icon: customChildIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      marker.bindPopup(`
        <div class="text-xs p-1">
          <p class="font-bold text-slate-900">${child.name} 현재 위치</p>
          <p class="text-slate-600 mt-0.5">${child.currentLocation.address || '실시간 추적 중'}</p>
          <p class="text-[10px] text-slate-400 mt-1">갱신: ${child.currentLocation.updatedAt}</p>
        </div>
      `);

      childMarkerRef.current = marker;
    }
  }, [child.currentLocation.lat, child.currentLocation.lng, child.name, child.avatar, mapReady]);

  // Sync academy markers and 10m geofence circles
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    // Remove old markers if needed
    Object.keys(academyMarkersRef.current).forEach((id) => {
      if (!academies.find((a) => a.id === id)) {
        academyMarkersRef.current[id].marker.remove();
        academyMarkersRef.current[id].circle.remove();
        delete academyMarkersRef.current[id];
      }
    });

    academies.forEach((acad) => {
      const isSelected = acad.id === selectedAcademyId;
      const distance = getDistanceMeters(
        child.currentLocation.lat,
        child.currentLocation.lng,
        acad.lat,
        acad.lng
      );
      const isInside = distance <= acad.geofenceRadius; // 10m

      // 10m Geofence Circle
      let circle = academyMarkersRef.current[acad.id]?.circle;
      if (!circle) {
        circle = L.circle([acad.lat, acad.lng], {
          radius: acad.geofenceRadius, // 10m
          color: acad.color,
          fillColor: acad.color,
          fillOpacity: isInside ? 0.45 : 0.2,
          weight: isSelected ? 3 : 2,
          dashArray: isInside ? undefined : '3, 3',
        }).addTo(map);
      } else {
        circle.setLatLng([acad.lat, acad.lng]);
        circle.setRadius(acad.geofenceRadius);
        circle.setStyle({
          color: acad.color,
          fillColor: acad.color,
          fillOpacity: isInside ? 0.45 : 0.2,
          weight: isSelected ? 3 : 2,
          dashArray: isInside ? undefined : '3, 3',
        });
      }

      // Marker Icon
      const acadIconHtml = `
        <div class="relative flex flex-col items-center">
          <div class="w-7 h-7 rounded-lg shadow-sm border-2 border-white flex items-center justify-center text-white text-[11px] font-bold transition-transform ${
            isSelected ? 'scale-110 ring-2 ring-slate-900' : ''
          }" style="background-color: ${acad.color}">
            ${acad.subject.slice(0, 1)}
          </div>
          <div class="bg-white/95 text-slate-800 font-semibold text-[9px] px-1 py-0.2 rounded shadow-2xs mt-0.5 whitespace-nowrap border border-slate-200">
            ${acad.name.length > 6 ? acad.name.slice(0, 5) + '..' : acad.name} (${acad.geofenceRadius}m)
          </div>
        </div>
      `;

      const customAcadIcon = L.divIcon({
        html: acadIconHtml,
        className: 'custom-academy-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      let marker = academyMarkersRef.current[acad.id]?.marker;
      if (!marker) {
        marker = L.marker([acad.lat, acad.lng], { icon: customAcadIcon }).addTo(map);
        marker.on('click', () => {
          onSelectAcademy(acad.id);
        });
      } else {
        marker.setLatLng([acad.lat, acad.lng]);
        marker.setIcon(customAcadIcon);
      }

      academyMarkersRef.current[acad.id] = { marker, circle };
    });
  }, [academies, selectedAcademyId, child.currentLocation.lat, child.currentLocation.lng, mapReady]);

  const handleRecenter = (type: 'child' | 'academy') => {
    if (!mapInstanceRef.current) return;
    if (type === 'child') {
      mapInstanceRef.current.flyTo([child.currentLocation.lat, child.currentLocation.lng], 18, {
        duration: 0.6,
      });
    } else if (selectedAcademyId) {
      const acad = academies.find((a) => a.id === selectedAcademyId);
      if (acad) {
        mapInstanceRef.current.flyTo([acad.lat, acad.lng], 18, { duration: 0.6 });
      }
    }
  };

  const handleUseRealGps = () => {
    if (!navigator.geolocation) {
      alert('브라우저에서 위치 정보(Geolocation)를 지원하지 않습니다.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onUpdateChildLocation(
          Number(pos.coords.latitude.toFixed(6)),
          Number(pos.coords.longitude.toFixed(6)),
          '현재 기기 실제 GPS 위치'
        );
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 18);
        }
      },
      (err) => {
        alert('위치 권한을 허용하지 않았거나 수신할 수 없습니다: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  // Precise simulation helper targeting 10m threshold
  const simulateMoveTo = (targetLat: number, targetLng: number, addressDesc: string, simName: string) => {
    setActiveSimulation(simName);
    onUpdateChildLocation(targetLat, targetLng, addressDesc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([targetLat, targetLng], 18, { duration: 0.6 });
    }
    setTimeout(() => setActiveSimulation(null), 1000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
      {/* Compact Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-gradient-to-r from-slate-50 to-indigo-50/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                실시간 위치 & 지오펜스
              </h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                반경 10m
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              학원 출입문 10m 이내 진입 시 자동 등원 처리
            </p>
          </div>
        </div>

        {/* Compact Action Controls */}
        <div className="flex items-center gap-1">
          <button
            id="btn-recenter-child"
            onClick={() => handleRecenter('child')}
            className="p-1.5 rounded-lg text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs"
            title="자녀 위치로 이동"
          >
            <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
          </button>

          <button
            id="btn-real-gps"
            onClick={handleUseRealGps}
            className="p-1.5 rounded-lg text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-2xs"
            title="실제 GPS 적용"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700"
            title={isExpanded ? '지도 축소' : '지도 확대'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Real-time Distance Status Ribbon */}
      <div className="bg-slate-50/90 px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 truncate">
          {nearest && nearest.isInside ? (
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>[{nearest.academy.name}] 10m 이내 진입 (등원 중)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                [{targetAcad.name}]까지 <strong>{formatDistance(nearest?.distance || 0)}</strong>
                <span className="text-slate-400 ml-1">(출석 기준: 10m)</span>
              </span>
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-400 shrink-0">
          오차 ±{child.currentLocation.accuracy}m
        </span>
      </div>

      {/* Leaflet Map Stage - Compact default height */}
      <div className={`relative w-full transition-all duration-300 bg-slate-100 ${
        isExpanded ? 'h-[320px]' : 'h-[190px] sm:h-[210px]'
      }`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Mini Legend */}
        <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-xs px-2 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-[10px] space-y-1 pointer-events-auto">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block border border-white" />
            <span>자녀 위치</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-indigo-500 bg-indigo-100/50 inline-block" />
            <span>출석 반경 (10m)</span>
          </div>
        </div>
      </div>

      {/* Compact Location Simulation Quick Bar */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-1 text-slate-600 text-[11px] font-medium">
          <Footprints className="w-3.5 h-3.5 text-indigo-600" />
          <span>시뮬레이션:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {/* Simulate Enter 10m Geofence */}
          <button
            id="sim-enter-academy"
            onClick={() =>
              simulateMoveTo(
                targetAcad.lat,
                targetAcad.lng,
                `${targetAcad.name} 정문 입구 (반경 10m 진입)`,
                'enter'
              )
            }
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs ${
              activeSimulation === 'enter'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title="반경 10m 안으로 진입하여 자동 등원 테스트"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>10m 진입 (등원)</span>
          </button>

          {/* Simulate 25m Approach (Outside 10m) */}
          <button
            id="sim-approach"
            onClick={() =>
              simulateMoveTo(
                targetAcad.lat + 0.00020,
                targetAcad.lng + 0.00018,
                `${targetAcad.name} 25m 앞 횡단보도 대기`,
                'approach'
              )
            }
            className="px-2 py-1 rounded-lg text-[11px] font-medium bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 transition flex items-center gap-1"
            title="학원 25m 접근 (10m 미진입)"
          >
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>25m 접근</span>
          </button>

          {/* Simulate Leave (Check-out) */}
          <button
            id="sim-leave-academy"
            onClick={() =>
              simulateMoveTo(
                targetAcad.lat + 0.0015,
                targetAcad.lng - 0.0012,
                '학원 10m 영역 이탈 후 이동 중',
                'leave'
              )
            }
            className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition flex items-center gap-1"
            title="학원 이탈 (하원)"
          >
            <Play className="w-3 h-3 text-slate-600" />
            <span>하원 이탈</span>
          </button>

          {/* Return Home */}
          <button
            id="sim-return-home"
            onClick={() =>
              simulateMoveTo(
                37.4930,
                127.0540,
                '집 (귀가 완료)',
                'home'
              )
            }
            className="px-1.5 py-1 rounded-lg text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition flex items-center gap-0.5"
            title="귀가"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>귀가</span>
          </button>
        </div>
      </div>
    </div>
  );
};
