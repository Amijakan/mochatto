import React from "react";
import AvatarDOM from "./AvatarDOM";

// for dragging and rendering avatars
function AvatarCanvas({
  selfPosition,
  setSelfPosition,
  positions,
}: {
  selfPosition: [number, number];
  setSelfPosition: (any) => void;
  positions: [number, number][];
}): JSX.Element {
  let offset;

  // on mouse down, add listeners for moving and mouse up
  const _onMouseDown = (event) => {
    offset = [event.clientX - selfPosition[0], event.clientY - selfPosition[1]];
    document.addEventListener("mousemove", _onMouseMove, true);
    document.addEventListener("mouseup", _onMouseUp, true);
    event.preventDefault();
  };

  // remove listeners on mouse up
  const _onMouseUp = () => {
    document.removeEventListener("mousemove", _onMouseMove, true);
    document.removeEventListener("mouseup", _onMouseUp, true);
  };

  // update mouse position on move
  const _onMouseMove = (event) => {
    // world coordinate
    const mousePos = [event.clientX, event.clientY];
    setSelfPosition([mousePos[0] - offset[0], mousePos[1] - offset[1]]);
  };

  return (
    <>
      <AvatarDOM key={0} onMouseDown={_onMouseDown} pos={selfPosition} isSelf={true} />
      {positions.map((position, index) => {
        return (
          <AvatarDOM
            key={index + 1}
            onMouseDown={() => {
              console.log("not your avatar!");
            }}
            pos={position}
            isSelf={false}
          />
        );
      })}
    </>
  );
}

export default AvatarCanvas;
