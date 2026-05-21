import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import type { LeafletMouseEvent } from "leaflet";

type LatLng = {
  lat: number;
  lng: number;
};

function ClickHandler({ onSelect }: { onSelect: (pos: LatLng) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function MapSelector({
  onSelect,
}: {
  onSelect: (pos: LatLng) => void;
}) {
  const [pos, setPos] = useState<LatLng | null>(null);

  return (
    <MapContainer
      center={[40.4168, -3.7038]}
      zoom={13}
      style={{ height: "300px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {pos && <Marker position={[pos.lat, pos.lng]} />}

      <ClickHandler
        onSelect={(p) => {
          setPos(p);
          onSelect(p);
        }}
      />
    </MapContainer>
  );
}