import React, { useRef, useCallback } from 'react'

const Draggable = (
  {
    children,
    position,
    onPositionChange = null,
    draggable = true,
  }: {
    children: JSX.Element | JSX.Element[]
    position: { x: number, y: number },
    onPositionChange?: ((position: { x: number, y: number }) => void) | null,
    draggable: boolean
  }
) => {
  // Offset for the difference between center of element and where the click actually occurred
  const offsetRef = useRef({ x: 0, y: 0 })
  const positionRef = useRef(position)

  const onPointerDown = useCallback((event) => {
    offsetRef.current = { x: event.clientX - positionRef.current.x, y: event.clientY - positionRef.current.y };
    document.addEventListener("pointermove", _onPointerMove, true);
    document.addEventListener("pointerup", _onPointerUp, true);
    event.preventDefault();
  }, []);

  // remove listeners on mouse up
  const _onPointerUp = useCallback(() => {
    document.removeEventListener("pointermove", _onPointerMove, true);
    document.removeEventListener("pointerup", _onPointerUp, true);
  }, []);

  // update mouse position on move
  const _onPointerMove = useCallback((event) => {
    // world coordinate
    const newPosition = { x: event.clientX - offsetRef.current.x, y: event.clientY - offsetRef.current.y };
    positionRef.current = newPosition
    if (onPositionChange) onPositionChange(newPosition)
  }, []);

  return (
    <div
      {...(draggable ? { onPointerDown: onPointerDown } : {})}
      style={{ position: 'absolute', top: position.y, left: position.x }}
    >
      {children}
    </div>)
}

export default Draggable
