import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent, WheelEvent as ReactWheelEvent } from 'react';
import { eventIcon } from '@/api';

interface Marker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  category: string;
  attendeesLabel?: string;
  draggable?: boolean;
}

interface YandexMapProps {
  markers: Marker[];
  selectedId?: number;
  userLocation?: { lat: number; lng: number } | null;
  onMarkerClick?: (id: number) => void;
  onMarkerDoubleClick?: (id: number) => void;
  onMarkerMove?: (id: number, coords: { lat: number; lng: number }) => void;
  onMarkerMoveEnd?: (id: number, coords: { lat: number; lng: number }) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onMapDoubleClick?: (coords: { lat: number; lng: number }) => void;
}

const TILE_SIZE = 256;
const DEFAULT_CENTER = { lat: 59.9343, lng: 30.3351 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lngToTileX = (lng: number, zoom: number) => ((lng + 180) / 360) * 2 ** zoom;

const latToTileY = (lat: number, zoom: number) => {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom;
};

const tileXToLng = (x: number, zoom: number) => (x / 2 ** zoom) * 360 - 180;

const tileYToLat = (y: number, zoom: number) => {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

const YandexMap = ({
  markers,
  selectedId,
  userLocation,
  onMarkerClick,
  onMarkerDoubleClick,
  onMarkerMove,
  onMarkerMoveEnd,
  onMapClick,
  onMapDoubleClick,
}: YandexMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const hasAutoCenteredRef = useRef(false);
  const suppressedClickMarkerIdRef = useRef<number | null>(null);
  const lastMarkerClickRef = useRef<{ id: number; at: number } | null>(null);
  const markerDragRef = useRef<{
    pointerId: number;
    markerId: number;
    moved: boolean;
  } | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    centerX: number;
    centerY: number;
    moved: boolean;
  } | null>(null);

  const selectedMarker = markers.find((marker) => marker.id === selectedId);
  const averageCenter = useMemo(() => {
    if (!markers.length) return DEFAULT_CENTER;
    return {
      lat: markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length,
      lng: markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length,
    };
  }, [markers]);

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(14);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return;

    const preventWheelScroll = (event: globalThis.WheelEvent) => {
      event.preventDefault();
    };

    node.addEventListener('wheel', preventWheelScroll, { passive: false });
    return () => node.removeEventListener('wheel', preventWheelScroll);
  }, []);

  useEffect(() => {
    if (selectedMarker) {
      setCenter({ lat: selectedMarker.lat, lng: selectedMarker.lng });
      hasAutoCenteredRef.current = true;
      return;
    }

    if (hasAutoCenteredRef.current) return;

    if (userLocation) {
      setCenter(userLocation);
      hasAutoCenteredRef.current = true;
      return;
    }

    if (markers.length) {
      setCenter(averageCenter);
      hasAutoCenteredRef.current = true;
    }
  }, [averageCenter, markers.length, selectedMarker, userLocation]);

  const centerTile = {
    x: lngToTileX(center.lng, zoom),
    y: latToTileY(center.lat, zoom),
  };

  const tiles = useMemo(() => {
    const radius = 3;
    const maxTile = 2 ** zoom;
    const startX = Math.floor(centerTile.x) - radius;
    const startY = Math.floor(centerTile.y) - radius;
    const nextTiles: Array<{ x: number; y: number; urlX: number; urlY: number; key: string }> = [];

    for (let x = startX; x <= startX + radius * 2; x += 1) {
      for (let y = startY; y <= startY + radius * 2; y += 1) {
        const urlX = ((x % maxTile) + maxTile) % maxTile;
        const urlY = clamp(y, 0, maxTile - 1);
        nextTiles.push({ x, y, urlX, urlY, key: `${zoom}-${x}-${y}` });
      }
    }

    return nextTiles;
  }, [centerTile.x, centerTile.y, zoom]);

  const markerPosition = (lat: number, lng: number) => ({
    left: `calc(50% + ${(lngToTileX(lng, zoom) - centerTile.x) * TILE_SIZE}px)`,
    top: `calc(50% + ${(latToTileY(lat, zoom) - centerTile.y) * TILE_SIZE}px)`,
  });

  const getCoordsFromPointer = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - rect.left - rect.width / 2) / TILE_SIZE;
    const dy = (event.clientY - rect.top - rect.height / 2) / TILE_SIZE;
    return {
      lat: tileYToLat(centerTile.y + dy, zoom),
      lng: tileXToLng(centerTile.x + dx, zoom),
    };
  };

  const markManualInteraction = () => {
    hasAutoCenteredRef.current = true;
  };

  const handleMapClick = (event: MouseEvent<HTMLDivElement>) => {
    if (dragRef.current?.moved || !onMapClick) return;
    markManualInteraction();
    onMapClick(getCoordsFromPointer(event));
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const nextZoom = clamp(zoom + (event.deltaY < 0 ? 1 : -1), 2, 18);
    if (nextZoom === zoom) return;

    markManualInteraction();

    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - rect.left - rect.width / 2) / TILE_SIZE;
    const dy = (event.clientY - rect.top - rect.height / 2) / TILE_SIZE;
    const cursorTileX = centerTile.x + dx;
    const cursorTileY = centerTile.y + dy;
    const cursorLng = tileXToLng(cursorTileX, zoom);
    const cursorLat = tileYToLat(cursorTileY, zoom);
    const nextCursorTileX = lngToTileX(cursorLng, nextZoom);
    const nextCursorTileY = latToTileY(cursorLat, nextZoom);

    setZoom(nextZoom);
    setCenter({
      lat: tileYToLat(nextCursorTileY - dy, nextZoom),
      lng: tileXToLng(nextCursorTileX - dx, nextZoom),
    });
  };

  return (
    <div
      ref={mapRef}
      className={isDragging ? 'map-canvas map-canvas--dragging' : 'map-canvas'}
      role="application"
      aria-label="Карта событий"
      onClick={handleMapClick}
      onWheel={handleWheel}
      onDoubleClick={(event) => {
        if ((event.target as HTMLElement).closest('.map-marker')) return;
        event.preventDefault();
        markManualInteraction();
        onMapDoubleClick?.(getCoordsFromPointer(event));
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          centerX: lngToTileX(center.lng, zoom),
          centerY: latToTileY(center.lat, zoom),
          moved: false,
        };
        setIsDragging(true);
      }}
      onPointerMove={(event) => {
        const markerDrag = markerDragRef.current;
        if (markerDrag?.pointerId === event.pointerId) {
          markerDrag.moved = true;
          markManualInteraction();
          onMarkerMove?.(
            markerDrag.markerId,
            getCoordsFromPointer(event as unknown as MouseEvent<HTMLDivElement>)
          );
          return;
        }

        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (Math.abs(dx) + Math.abs(dy) > 3) {
          drag.moved = true;
        }
        markManualInteraction();
        const nextX = drag.centerX - dx / TILE_SIZE;
        const nextY = drag.centerY - dy / TILE_SIZE;
        setCenter({
          lat: tileYToLat(nextY, zoom),
          lng: tileXToLng(nextX, zoom),
        });
      }}
      onPointerUp={(event) => {
        const markerDrag = markerDragRef.current;
        if (markerDrag?.pointerId === event.pointerId) {
          suppressedClickMarkerIdRef.current = markerDrag.moved
            ? markerDrag.markerId
            : null;
          onMarkerMoveEnd?.(
            markerDrag.markerId,
            getCoordsFromPointer(event as unknown as MouseEvent<HTMLDivElement>)
          );
          markerDragRef.current = null;
        }

        const drag = dragRef.current;
        if (drag?.pointerId === event.pointerId) {
          event.currentTarget.releasePointerCapture(event.pointerId);
          window.setTimeout(() => {
            dragRef.current = null;
          }, 0);
        }
        setIsDragging(false);
      }}
      onPointerCancel={() => {
        dragRef.current = null;
        setIsDragging(false);
      }}
    >
      <div className="osm-tiles" aria-hidden="true">
        {tiles.map((tile) => (
          <img
            key={tile.key}
            className="osm-tile"
            src={`https://tile.openstreetmap.org/${zoom}/${tile.urlX}/${tile.urlY}.png`}
            alt=""
            draggable={false}
            style={{
              left: `calc(50% + ${(tile.x - centerTile.x) * TILE_SIZE}px)`,
              top: `calc(50% + ${(tile.y - centerTile.y) * TILE_SIZE}px)`,
            }}
          />
        ))}
      </div>

      {markers.map((marker) => (
        <span
          key={marker.id}
          role="button"
          tabIndex={0}
          className={[
            selectedId === marker.id ? 'map-marker map-marker--active' : 'map-marker',
            marker.draggable ? 'map-marker--draggable' : '',
          ].filter(Boolean).join(' ')}
          style={markerPosition(marker.lat, marker.lng)}
          title={marker.title}
          onPointerDown={(event) => {
            event.stopPropagation();
            if (!marker.draggable) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            markerDragRef.current = {
              pointerId: event.pointerId,
              markerId: marker.id,
              moved: false,
            };
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (suppressedClickMarkerIdRef.current === marker.id) {
              suppressedClickMarkerIdRef.current = null;
              return;
            }

            const now = Date.now();
            if (
              marker.id === -1 &&
              lastMarkerClickRef.current?.id === marker.id &&
              now - lastMarkerClickRef.current.at < 300
            ) {
              lastMarkerClickRef.current = null;
              onMarkerDoubleClick?.(marker.id);
              return;
            }

            lastMarkerClickRef.current = { id: marker.id, at: now };
            markManualInteraction();
            if (marker.id !== -1) {
              setCenter({ lat: marker.lat, lng: marker.lng });
            }
            onMarkerClick?.(marker.id);
          }}
          onDoubleClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            lastMarkerClickRef.current = null;
            onMarkerDoubleClick?.(marker.id);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              markManualInteraction();
              setCenter({ lat: marker.lat, lng: marker.lng });
              onMarkerClick?.(marker.id);
            }
          }}
        >
          {marker.attendeesLabel && <i className="map-marker__count">{marker.attendeesLabel}</i>}
          <b>{eventIcon(marker.category)}</b>
        </span>
      ))}

      {userLocation && (
        <span className="user-location-marker" style={markerPosition(userLocation.lat, userLocation.lng)} title="Вы здесь">
          <b />
        </span>
      )}

      <div className="map-controls">
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            markManualInteraction();
            setZoom((value) => clamp(value + 1, 2, 18));
          }}
          aria-label="Приблизить"
        >
          +
        </button>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            markManualInteraction();
            setZoom((value) => clamp(value - 1, 2, 18));
          }}
          aria-label="Отдалить"
        >
          -
        </button>
        {userLocation && (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              markManualInteraction();
              setCenter(userLocation);
            }}
            aria-label="Показать мое местоположение"
            title="Мое местоположение"
          >
            ●
          </button>
        )}
      </div>

      <a className="map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
        © OpenStreetMap
      </a>
    </div>
  );
};

export default YandexMap;
