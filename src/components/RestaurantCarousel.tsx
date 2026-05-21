import { useDragScroll } from "../hooks/useDragScroll";

type Restaurant = {
  id: number;
  nombre: string;
  direccion: string;
  activo: boolean; // 🔥 IMPORTANTE
};

type Props = {
  restaurantes: Restaurant[];
  selected: number | null;
  onSelect: (id: number) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function RestaurantCarousel({
  restaurantes,
  selected,
  onSelect,
  onToggle,
}: Props) {
  const drag = useDragScroll();

  return (
    <div className="restaurant-carousel">
      <h4>🏪 Selecciona restaurante</h4>

      <div
        className="restaurant-list"
        ref={drag.ref}
        onMouseDown={drag.onMouseDown}
        onMouseLeave={drag.onMouseLeave}
        onMouseUp={drag.onMouseUp}
        onMouseMove={drag.onMouseMove}
        onWheel={drag.onWheel}
      >
        {restaurantes.map((r) => (
          <div
            key={r.id}
            className={`restaurant-item ${
              selected === r.id ? "active" : ""
            }`}
            onClick={() => onSelect(r.id)}
          >
            <div>
              <b>{r.nombre}</b>
              <p>{r.direccion}</p>
            </div>

            <div className="actions">

              {/* 🔥 INDICADOR ESTADO */}
              <button
                type="button"
                className={`status-btn ${
                  r.activo ? "enabled" : "disabled"
                }`}
              >
                {r.activo ? "🟢" : "🔴"}
              </button>

              {/* 🔥 TOGGLE */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(r.id);
                }}
              >
                🔄
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}