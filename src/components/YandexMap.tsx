import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent, WheelEvent } from 'react';
import { eventIcon } from '@/api';

interface Marker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  category: string;
}

interface YandexMapProps {
  markers: Marker[];
  selectedId?: number;
  userLocation?: { lat: number; lng: number } | null;
  onMarkerClick?: (id: number) => void;
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
  onMapClick,
  onMapDoubleClick,
}: YandexMapProps) => {
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    centerX: number;
    centerY: number;
    moved: boolean;
  } | null>(null);
  const selectedMarker = markers.find((marker) => marker.id === selectedId);
  const initialCenter = useMemo(() => {
    if (selectedMarker) return { lat: selectedMarker.lat, lng: selectedMarker.lng };
    if (userLocation) return userLocation;
    if (!markers.length) return DEFAULT_CENTER;
    return {
      lat: markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length,
      lng: markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length,
    };
  }, [markers, selectedMarker, userLocation]);

  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(14);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setCenter(initialCenter);
  }, [initialCenter]);

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

  const handleMapClick = (event: MouseEvent<HTMLDivElement>) => {
    if (dragRef.current?.moved) return;
    if (!onMapClick) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - rect.left - rect.width / 2) / TILE_SIZE;
    const dy = (event.clientY - rect.top - rect.height / 2) / TILE_SIZE;
    onMapClick({
      lat: tileYToLat(centerTile.y + dy, zoom),
      lng: tileXToLng(centerTile.x + dx, zoom),
    });
  };

  const getCoordsFromPointer = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - rect.left - rect.width / 2) / TILE_SIZE;
    const dy = (event.clientY - rect.top - rect.height / 2) / TILE_SIZE;
    return {
      lat: tileYToLat(centerTile.y + dy, zoom),
      lng: tileXToLng(centerTile.x + dx, zoom),
    };
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const nextZoom = clamp(zoom + (event.deltaY < 0 ? 1 : -1), 2, 18);
    if (nextZoom === zoom) return;

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
      className={isDragging ? 'map-canvas map-canvas--dragging' : 'map-canvas'}
      role="application"
      aria-label="Карта событий OpenStreetMap"
      onClick={handleMapClick}
      onWheel={handleWheel}
      onDoubleClick={(event) => {
        event.preventDefault();
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
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (Math.abs(dx) + Math.abs(dy) > 3) {
          drag.moved = true;
        }
        const nextX = drag.centerX - dx / TILE_SIZE;
        const nextY = drag.centerY - dy / TILE_SIZE;
        setCenter({
          lat: tileYToLat(nextY, zoom),
          lng: tileXToLng(nextX, zoom),
        });
      }}
      onPointerUp={(event) => {
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
          className={selectedId === marker.id ? 'map-marker map-marker--active' : 'map-marker'}
          style={markerPosition(marker.lat, marker.lng)}
          title={marker.title}
          onClick={(event) => {
            event.stopPropagation();
            setCenter({ lat: marker.lat, lng: marker.lng });
            onMarkerClick?.(marker.id);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setCenter({ lat: marker.lat, lng: marker.lng });
              onMarkerClick?.(marker.id);
            }
          }}
        >
          <b>{eventIcon(marker.category)}</b>
        </span>
      ))}

      {userLocation && (
        <span className="user-location-marker" style={markerPosition(userLocation.lat, userLocation.lng)} title="Вы здесь">
          <b />
        </span>
      )}

      <div className="map-controls">
        <button type="button" onClick={() => setZoom((value) => clamp(value + 1, 2, 18))} aria-label="Приблизить">
          +
        </button>
        <button type="button" onClick={() => setZoom((value) => clamp(value - 1, 2, 18))} aria-label="Отдалить">
          -
        </button>
        {userLocation && (
          <button
            type="button"
            onClick={() => setCenter(userLocation)}
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
