import React, { useEffect } from "react";

function AvatarDOM({
  onMouseDown,
  pos,
  isSelf,
  color,
}: {
  onMouseDown: (MouseEvent) => void;
  pos: [number, number];
  isSelf: boolean;
  color: string;
}): JSX.Element {
  // returns a randomly generated pastel color
  const getColor = (random: number, lighteness: number) => {
    return "hsl(" + 360 * random + "," + (30 + 70 * random) + "%," + 70 * lighteness + "%)";
  };
  useEffect(() => {
    const avatardom = document.querySelector(".avatar");
    if (avatardom) {
      if (isSelf) {
        (avatardom as HTMLElement).style.zIndex = "1";
      }
    }
  }, []);
  return (
    <div
      className="avatar"
      onMouseDown={onMouseDown}
      style={{
        width: "50px",
        height: "50px",
        background: color,
        position: "absolute",
        left: pos[0],
        top: pos[1],
      }}
    ></div>
  );
}

export default AvatarDOM;
