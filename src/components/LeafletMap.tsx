'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ExternalLink, X, RotateCcw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicMapData } from '@/lib/public-actions';

export interface LocationItem {
  id: string | number;
  name: string;
  coordinates: [number, number];
  address: string;
  googleMapsUrl: string;
  description: string;
  icon_color?: string;
  sort_order?: number;
  pageSlug?: string;
}

export interface DbMapLocation {
  id: string;
  name: unknown;
  description: unknown;
  lat: number;
  lng: number;
  icon_color?: string;
  sort_order?: number;
  is_published?: boolean;
  google_maps_url?: string;
  page_id?: string | null;
  pages?: { id: string; slug: string; title: Record<string, string> } | null;
}

// Fallback locations if DB is empty
const fallbackLocations: LocationItem[] = [
  {
    id: 1,
    name: 'Tháp Bà Ponagar',
    coordinates: [12.2653665, 109.1953678],
    address: 'Đường 2 Tháng 4, Vĩnh Phước, Nha Trang, Khánh Hòa',
    googleMapsUrl: 'https://maps.app.goo.gl/B5tyATiAgiUHtbZb9',
    description: 'Quần thể đền tháp Chăm nổi tiếng nhất, thờ Nữ thần Thiên Y A Na (Mẹ xứ sở). Được xây dựng từ khoảng thế kỷ VIII đến XIII, đây là biểu tượng văn hóa tâm linh đặc sắc của vùng đất Khánh Hòa.',
    sort_order: 1
  },
  {
    id: 2,
    name: 'Tháp Chàm Phan Rang (Po Klong Garai)',
    coordinates: [11.6019055, 108.946504],
    address: 'Đồi Trầu, Phường Đô Vinh, Phan Rang - Tháp Chàm, Ninh Thuận',
    googleMapsUrl: 'https://maps.app.goo.gl/dpGnjncsyZCSDtm96',
    description: 'Cụm tháp Chăm hùng vĩ và còn nguyên vẹn nhất Việt Nam, được xây dựng vào cuối thế kỷ XIII đầu thế kỷ XIV dưới triều vua Po Klong Garai. Tháp mang phong cách kiến trúc muộn (phong cách Bình Định).',
    sort_order: 2
  },
  {
    id: 3,
    name: 'Di tích Tháp Chăm Hòa Lai',
    coordinates: [11.6760419, 109.0356271],
    address: 'Quốc lộ 1A, Xã Tân Hải, Ninh Hải, Ninh Thuận',
    googleMapsUrl: 'https://maps.app.goo.gl/XVNFZXyJaKXijrBH7',
    description: 'Cụm tháp cổ kính được xây dựng từ thế kỷ IX, là đại diện tiêu biểu cho phong cách kiến trúc Hòa Lai trong lịch sử nghệ thuật Champa.',
    sort_order: 3
  },
  {
    id: 4,
    name: 'Tháp Po Ro Me',
    coordinates: [11.5012111, 108.8658294],
    address: 'Xã Phước Hữu, Huyện Ninh Phước, Ninh Thuận',
    googleMapsUrl: 'https://maps.app.goo.gl/Kidr4NvqbQXDjNjr5',
    description: 'Ngôi tháp cuối cùng được xây dựng trong lịch sử Champa (thế kỷ XVII), thờ vua Po Ro Me - người có công lớn trong việc phát triển thủy lợi và nông nghiệp.',
    sort_order: 4
  },
  {
    id: 5,
    name: 'Trung Tâm Nghiên Cứu Văn Hóa Chăm - Phan Rang',
    coordinates: [11.5638583, 108.9938231],
    address: '28 Tô Hiệu, Phường Kinh Dinh, Phan Rang - Tháp Chàm, Ninh Thuận',
    googleMapsUrl: 'https://maps.app.goo.gl/9utgZ4QGbXBUdR6Q9',
    description: 'Nơi lưu trữ, nghiên cứu và trưng bày các tài liệu, di vật, trang phục và nhạc cụ truyền thống của đồng bào Chăm.',
    sort_order: 5
  },
  {
    id: 6,
    name: 'Bảo Tàng Khánh Hòa',
    coordinates: [12.2497043, 109.1962195],
    address: '16 Trần Phú, Xương Huân, Nha Trang, Khánh Hòa',
    googleMapsUrl: 'https://maps.app.goo.gl/pBJ1MH1XQP8jLrmP8',
    description: 'Bảo tàng lưu giữ hàng nghìn hiện vật lịch sử văn hóa của tỉnh, trong đó có bộ sưu tập điêu khắc và bia ký Champa cực kỳ quý giá phát hiện tại Khánh Hòa.',
    sort_order: 6
  },
  {
    id: 7,
    name: 'Bảo Tàng Ninh Thuận',
    coordinates: [11.5642863, 108.9994946],
    address: 'Đường 16 Tháng 4, Tấn Tài, Phan Rang - Tháp Chàm, Ninh Thuận',
    googleMapsUrl: 'https://maps.app.goo.gl/9yFWrDJrkeWMcbdY7',
    description: 'Bảo tàng trưng bày các hiện vật khảo cổ di chỉ gốm Chăm cổ, công cụ lao động và hiện vật đời sống văn hóa xã hội đặc trưng của người Chăm tại Ninh Thuận.',
    sort_order: 7
  }
];

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '');
};


const getButtonLabels = (lang: string) => {
  switch (lang) {
    case 'en':
      return { details: 'View Details', gmaps: 'Google Maps' };
    case 'ru':
      return { details: 'Подробнее', gmaps: 'Google Карты' };
    case 'zh':
      return { details: '查看详情', gmaps: '谷歌地图' };
    default:
      return { details: 'Xem chi tiết', gmaps: 'Xem Google Map' };
  }
};

const findMatchingLocation = (
  locations: LocationItem[],
  onlyLocationId?: string | number,
  slug?: string
): LocationItem | null => {
  if (onlyLocationId) {
    // 1. Try exact ID match
    const byId = locations.find((loc) => String(loc.id) === String(onlyLocationId));
    if (byId) return byId;

    // 2. Try sort_order match if onlyLocationId is a number
    const numId = Number(onlyLocationId);
    if (!isNaN(numId)) {
      const bySortOrder = locations.find((loc) => loc.sort_order === numId);
      if (bySortOrder) return bySortOrder;
    }
  }

  // 3. Try route slug match
  if (slug) {
    const normalizedSlug = normalizeText(slug);
    let matchQuery = normalizedSlug;
    if (normalizedSlug === 'poklong') {
      matchQuery = 'poklonggarai';
    } else if (normalizedSlug === 'porome') {
      matchQuery = 'porome';
    }

    const bySlug = locations.find((loc) => {
      const normalizedName = normalizeText(loc.name);
      return normalizedName.includes(matchQuery) || matchQuery.includes(normalizedName);
    });

    if (bySlug) return bySlug;
  }

  return null;
};

const MAP_CENTER: [number, number] = [11.92, 109.03];
const DEFAULT_ZOOM = 8;

export interface LeafletMapProps {
  onlyLocationId?: string | number;
  locationIds?: Array<string | number>;
}

export default function LeafletMap({ onlyLocationId, locationIds }: LeafletMapProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const [dbLocations, setDbLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState<LocationItem | null>(null);

  // Fetch published map locations
  useEffect(() => {
    async function fetchLocations() {
      try {
        const data = await getPublicMapData();

        if (data && data.length > 0) {
          const dbData = data as unknown as DbMapLocation[];
          const mapped: LocationItem[] = dbData.map((loc) => {
            const nameObj = typeof loc.name === 'object' && loc.name !== null ? (loc.name as Record<string, string>) : {};
            const descObj = typeof loc.description === 'object' && loc.description !== null ? (loc.description as Record<string, string>) : {};

            const localizedName = nameObj[locale] || nameObj['vi'] || '';
            const localizedDesc = descObj[locale] || descObj['vi'] || '';

            return {
              id: loc.id,
              name: localizedName,
              coordinates: [Number(loc.lat), Number(loc.lng)],
              address: `Tọa độ: ${Number(loc.lat).toFixed(4)}, ${Number(loc.lng).toFixed(4)}`,
              googleMapsUrl: loc.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${Number(loc.lat)},${Number(loc.lng)}`,
              description: localizedDesc,
              icon_color: loc.icon_color || '#c8920c',
              sort_order: loc.sort_order,
              pageSlug: loc.pages?.slug ?? undefined,
            };
          });
          setDbLocations(mapped);
        }
      } catch (err) {
        console.error('Error fetching map locations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, [locale]);
  const currentLocations = dbLocations.length > 0 ? dbLocations : fallbackLocations;

  const slug = params?.slug as string | undefined;
  const hasLocationIds = Array.isArray(locationIds) && locationIds.length > 0;

  // Sync state when onlyLocationId, locationIds, slug, or dbLocations changes (adjusting state during render)
  const [prevOnlyLocationId, setPrevOnlyLocationId] = useState<string | number | undefined>(onlyLocationId);
  const [prevLocationIds, setPrevLocationIds] = useState<Array<string | number> | undefined>(locationIds);
  const [prevSlug, setPrevSlug] = useState<string | undefined>(slug);
  const [prevDbLocations, setPrevDbLocations] = useState<LocationItem[]>(dbLocations);

  if (
    onlyLocationId !== prevOnlyLocationId ||
    JSON.stringify(locationIds) !== JSON.stringify(prevLocationIds) ||
    slug !== prevSlug ||
    dbLocations !== prevDbLocations
  ) {
    setPrevOnlyLocationId(onlyLocationId);
    setPrevLocationIds(locationIds);
    setPrevSlug(slug);
    setPrevDbLocations(dbLocations);
    if (currentLocations.length > 0) {
      if (hasLocationIds) {
        const selected = currentLocations.filter((loc) =>
          locationIds.map(String).includes(String(loc.id))
        );
        if (selected.length === 1) {
          setActiveLocation(selected[0]);
        } else {
          setActiveLocation(null);
        }
      } else {
        const matched = findMatchingLocation(currentLocations, onlyLocationId, slug);
        const isSingle = !!matched && (!!onlyLocationId || (!!slug && slug !== 'home' && slug !== 'blog'));
        if (isSingle && matched) {
          setActiveLocation(matched);
        } else {
          setActiveLocation(null);
        }
      }
    }
  }

  // Find matched location and determine single location display mode
  let matchedLocation: LocationItem | null = null;
  let isSingleLocation = false;

  if (hasLocationIds) {
    const selected = currentLocations.filter((loc) =>
      locationIds.map(String).includes(String(loc.id))
    );
    if (selected.length === 1) {
      matchedLocation = selected[0];
      isSingleLocation = true;
    }
  } else {
    matchedLocation = findMatchingLocation(currentLocations, onlyLocationId, slug);
    isSingleLocation = !!matchedLocation && (!!onlyLocationId || (!!slug && slug !== 'home' && slug !== 'blog'));
  }

  const filteredLocations = hasLocationIds
    ? currentLocations.filter((loc) => locationIds.map(String).includes(String(loc.id)))
    : (isSingleLocation && matchedLocation
        ? [matchedLocation]
        : currentLocations);

  const targetCenter: [number, number] = isSingleLocation && matchedLocation
    ? matchedLocation.coordinates
    : (hasLocationIds && filteredLocations.length > 0
        ? filteredLocations[0].coordinates
        : MAP_CENTER);

  const targetZoom = isSingleLocation ? 14 : DEFAULT_ZOOM;

  // Create custom SVG markers
  const createCustomIcon = (isActive: boolean, color: string = '#c8920c') => {
    const width = isActive ? 32 : 24;
    const height = isActive ? 42 : 32;
    const fill = isActive ? '#b85030' : color;

    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center transition-transform duration-200">
          ${isActive ? '<div class="absolute w-8 h-8 bg-terra/20 rounded-full animate-ping z-0 pointer-events-none"></div>' : ''}
          <svg width="${width}" height="${height}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10 drop-shadow-md">
            <path d="M12 0C5.37258 0 0 5.37258 0 12C0 20.4 12 32 12 32C12 32 24 20.4 24 12C24 5.37258 18.6274 0 12 0ZM12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17Z" fill="${fill}" stroke="#ffffff" stroke-width="1.2"/>
          </svg>
        </div>
      `,
      className: 'custom-leaflet-marker-pin',
      iconSize: [width, height],
      iconAnchor: [width / 2, height],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (loading) return;
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markersRef.current = {};
    }

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: targetCenter,
      zoom: targetZoom,
      zoomControl: false,
    });

    mapRef.current = map;

    // Add Custom Zoom Control to top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Google Maps Tile Layer
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    }).addTo(map);

    // Add Markers
    filteredLocations.forEach((loc) => {
      const marker = L.marker(loc.coordinates, {
        icon: createCustomIcon(
          activeLocation ? String(activeLocation.id) === String(loc.id) : false,
          loc.icon_color
        ),
      }).addTo(map);

      // Handle Marker Click
      marker.on('click', () => {
        setActiveLocation(loc);
        map.panTo(loc.coordinates);
      });

      markersRef.current[String(loc.id)] = marker;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, filteredLocations]);

  // Update active marker icon state when activeLocation changes
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([idStr, m]) => {
      const loc = currentLocations.find((l) => String(l.id) === idStr);
      const isActive = activeLocation ? String(activeLocation.id) === idStr : false;
      m.setIcon(createCustomIcon(isActive, loc?.icon_color));
    });
  }, [activeLocation, currentLocations]);

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView(targetCenter, targetZoom);
      if (isSingleLocation && filteredLocations[0]) {
        setActiveLocation(filteredLocations[0]);
      } else {
        setActiveLocation(null);
      }
    }
  };

  const handleLocationClick = (loc: LocationItem) => {
    setActiveLocation(loc);
    if (mapRef.current) {
      mapRef.current.setView(loc.coordinates, 13);
    }
  };

  const showSidebar = !isSingleLocation;

  if (loading) {
    return (
      <div className="w-full h-[620px] bg-forest/20 rounded border border-white/5 animate-pulse flex items-center justify-center text-white/40 font-serif italic">
        Đang tải bản đồ di sản...
      </div>
    );
  }

  return (
    <div className="relative w-full h-[620px] rounded overflow-hidden border border-white/10 shadow-2xl flex max-md:flex-col">
      {/* Sidebar - locations list */}
      {showSidebar && (
        <div className="w-80 bg-forest/95 border-r border-white/10 overflow-y-auto flex flex-col justify-start shrink-0 z-10 max-md:w-full max-md:h-48 max-md:border-r-0 max-md:border-b">
          <div className="p-4 border-b border-white/10 sticky top-0 bg-forest/95 backdrop-blur-md z-10 flex items-center justify-between">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-gold-lt">Các Địa Điểm</h4>
            <button
              onClick={handleResetView}
              className="text-white/50 hover:text-white transition-colors p-1 hover:bg-white/5 rounded flex items-center gap-1.5 text-xs font-semibold"
              title="Reset Map View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại
            </button>
          </div>
          <div className="flex-1 divide-y divide-white/5">
            {filteredLocations.map((loc) => {
              const isActive = activeLocation?.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleLocationClick(loc)}
                  className={`w-full text-left p-3.5 transition-colors flex gap-2.5 items-start ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/76 hover:text-white'
                    }`}
                >
                  <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-gold-lt' : 'text-terra'}`} />
                  <div className="min-w-0">
                    <h5 className="font-semibold text-[0.88rem] leading-tight mb-1 truncate">{loc.name}</h5>
                    <p className="text-[0.72rem] text-white/50 line-clamp-1">{loc.address}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative h-full">
        {!isSingleLocation && (
          <button
            onClick={handleResetView}
            className="absolute top-4 left-16 z-400 bg-white text-zinc-800 font-semibold px-4 py-2 rounded shadow-md border border-zinc-200/50 hover:bg-zinc-50 transition-all text-xs flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-terra" />
            <span>Đặt lại dữ liệu vùng này</span>
          </button>
        )}

        <div ref={mapContainerRef} className="w-full h-full bg-forest/20" />

        {/* Floating details overlay card */}
        <AnimatePresence>
          {activeLocation && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute bottom-5 left-5 right-5 md:left-5 md:right-auto md:w-[420px] z-400 bg-forest/90 backdrop-blur-md border border-white/14 rounded shadow-2xl p-5 text-white overflow-hidden"
            >
              <div className="flex justify-between items-start gap-3 mb-2.5">
                <div className="flex gap-2 items-start min-w-0">
                  <MapPin className="w-5 h-5 text-gold-lt shrink-0 mt-0.5" />
                  <h4 className="font-serif text-[1.125rem] font-bold leading-snug text-white">{activeLocation.name}</h4>
                </div>
                {!isSingleLocation && (
                  <button
                    onClick={() => setActiveLocation(null)}
                    className="text-white/40 hover:text-white p-1 hover:bg-white/5 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-[0.75rem] text-white/50 mb-3.5 leading-snug">{activeLocation.address}</p>
              <p className="text-[0.88rem] text-white/84 leading-[1.6] mb-5 text-justify">{activeLocation.description}</p>

              <div className="flex gap-2.5">
                {(() => {
                  const labels = getButtonLabels(locale);
                  if (activeLocation.pageSlug) {
                    return (
                      <>
                        <Link
                          href={`/${locale}/${activeLocation.pageSlug}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-black rounded text-xs font-bold tracking-wide transition-all shadow-md"
                        >
                          <span>{labels.details}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <a
                          href={activeLocation.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 border border-white/20 hover:bg-white/10 text-white rounded text-xs font-semibold tracking-wide transition-all shadow-md"
                        >
                          <span>{labels.gmaps}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </>
                    );
                  }
                  return (
                    <a
                      href={activeLocation.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-terra hover:bg-terra-dark text-white rounded text-xs font-bold tracking-wide transition-all shadow-md"
                    >
                      <span>{labels.gmaps}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
