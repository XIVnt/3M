import { useRef } from "react";

export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);

  const state = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  // =========================
  // DRAG (mouse)
  // =========================
  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;

    state.current.isDown = true;
    state.current.startX = e.pageX - ref.current.offsetLeft;
    state.current.scrollLeft = ref.current.scrollLeft;
  };

  const onMouseLeave = () => {
    state.current.isDown = false;
  };

  const onMouseUp = () => {
    state.current.isDown = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!state.current.isDown || !ref.current) return;

    e.preventDefault();

    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - state.current.startX) * 1.5;

    ref.current.scrollLeft = state.current.scrollLeft - walk;
  };

  // =========================
  // WHEEL (RUEDA DEL RATÓN)
  // =========================
 const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
  if (!ref.current) return;

  e.preventDefault();
  e.stopPropagation();

  ref.current.scrollLeft += e.deltaY;
};

  return {
    ref,

    // drag
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,

    // wheel
    onWheel,
  };
}