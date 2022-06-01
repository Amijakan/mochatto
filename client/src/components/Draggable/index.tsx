import React, { useRef, useCallback } from 'react'

const Draggable = (
  {
    children,
    position,
    updatePosition = () => { },
    draggable = true,
  }: {
    children: React.ReactComponent | React.ReactComponent[]
    position: { x: number, y: number },
    updatePosition?: (position: { x: number, y: number }) => void,
    draggable: boolean
  }
) => {
  // on mouse down, add listeners for moving and mouse up
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
    updatePosition(newPosition)
  }, []);

  return (
    <div
      onPointerDown={draggable && onPointerDown}
      style={{ position: 'absolute', top: position.y, left: position.x }}
    >
      {children}
    </div>)
}

export default Draggable
