import React, { useState, useEffect } from "react";
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
  const [avatarColor, setAvatarColor] = useState("gray");
  const [borderColor, setBorderColor] = useState("black");
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

  // returns a randomly generated pastel color
  const getColor = (random: number, lighteness: number) => {
    return "hsl(" + 360 * random + "," + (30 + 70 * random) + "%," + 70 * lighteness + "%)";
  };

  useEffect(() => {
    const random = Math.random();
    const avatarColor = getColor(random, 1);
    const borderColor = getColor(random, 1.2);
    setAvatarColor(avatarColor);
    setBorderColor(borderColor);
  }, []);

  return (
    <>
      <AvatarDOM
        key={0}
        onMouseDown={_onMouseDown}
        color={"#" + avatarColor}
        pos={selfPosition}
        isSelf={true}
      />
      {positions.map((position, index) => {
        return (
          <AvatarDOM
            key={index + 1}
            onMouseDown={(e) => {
              console.log("not your avatar!");
            }}
            color="black"
            pos={position}
            isSelf={false}
          />
        );
      })}
    </>
  );
}

export default AvatarCanvas;
