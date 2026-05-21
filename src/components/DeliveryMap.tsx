import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };

type Restaurante = {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
};

type Props = {
  restaurante: Restaurante;
  location: LatLng | null;
  onSelect: (pos: LatLng) => void;
  onDrag: (pos: LatLng, isInside: boolean) => void;
  mode?: "domicilio" | "recoger"
};

const RADIUS_KM = 5;


// ICONOS
const restaurantIcon = new L.Icon({
  iconUrl: "/img/Image.png",
  iconSize: [80, 80],
  iconAnchor: [40, 70],
});

const userIcon = new L.Icon({
  iconUrl: "/img/Delivery.png",
  iconSize: [85, 85],
  iconAnchor: [35, 70],
});



// DISTANCIA
function getDistanceKm(a: LatLng, b: LatLng) {
  const R = 6371;

  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// FIX MAP SIZE
function FixMapSize() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [map]);

  return null;
}

// CLICK MAP
function LocationPicker({ onSelect, disabled, }: { onSelect: (pos: LatLng) => void; disabled?: boolean; }) {
  useMapEvents({
    click(e) {
      if (disabled) return;

      onSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

    return null;
}

export default function DeliveryMap({

  restaurante,
  location,
  onSelect,
  onDrag,
  mode,
}: Props) {

  const isRecoger = mode === "recoger";

  const isInside = useMemo(() => {
    if (!location) return false;

    return (
      getDistanceKm(
        { lat: restaurante.lat, lng: restaurante.lng },
        location
      ) <= RADIUS_KM
    );
  }, [location, restaurante]);

  return (
    <div style={{ width: "100%", marginTop: 10 }}>

      <MapContainer
        center={[restaurante.lat, restaurante.lng]}
        zoom={14}
        style={{ height: "300px", width: "100%", borderRadius: "12px" }}
      >
        <FixMapSize />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker
          position={[restaurante.lat, restaurante.lng]}
          icon={restaurantIcon}
        />

        {!isRecoger && (
          <Circle
            center={[restaurante.lat, restaurante.lng]}
            radius={RADIUS_KM * 1000}
            pathOptions={{
              color: "#a855f7",
              fillColor: "#a855f7",
              fillOpacity: 0.15,
            }}
          />
        )}

        {location && !isRecoger && (
          <Marker
            position={[location.lat, location.lng]}
            icon={userIcon}
            draggable={!isRecoger}
            eventHandlers={{
              dragend: (e) => {
                const pos = e.target.getLatLng();

                const newPos = {
                  lat: pos.lat,
                  lng: pos.lng,
                };

                const inside =
                  getDistanceKm(
                    { lat: restaurante.lat, lng: restaurante.lng },
                    newPos
                  ) <= RADIUS_KM;

                onDrag(newPos, inside);
              },
            }}
          />
        )}

        <LocationPicker onSelect={onSelect} disabled={isRecoger} />
      </MapContainer>
      <div style={{ marginTop: 10 }}>
        {isInside ? (
          <p style={{ color: "green" }}>✔ Dirección válida</p>
        ) : (
          <p style={{ color: "red" }}>❌ Fuera de rango</p>
        )}
      </div>
    </div>
  );
}