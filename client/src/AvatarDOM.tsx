import React, { useEffect } from "react";

function AvatarDOM({
  onMouseDown,
  pos,
  isSelf,
}: {
  onMouseDown: (MouseEvent) => void;
  pos: [number, number];
  isSelf: boolean;
}): JSX.Element {
  // returns a randomly generated pastel color
  const getColor = (random: number, lighteness: number) => {
    return "hsl(" + 360 * random + "," + (30 + 70 * random) + "%," + 70 * lighteness + "%)";
  };
  useEffect(() => {
    const random = Math.random();
    const avatarColor = getColor(random, 1);
    const borderColor = getColor(random, 1.2);
    const avatardom = document.querySelector(".avatar");
    if (avatardom) {
      (avatardom as HTMLElement).style.backgroundColor = avatarColor;
      (avatardom as HTMLElement).style.borderColor = borderColor;
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
        width: "65px",
        height: "65px",
        borderRadius: "100%",
        borderColor: "black",
        borderStyle: "solid",
        background: "black",
        position: "absolute",
        left: pos[0],
        top: pos[1],
      }}
    ></div>
  );
}

export default AvatarDOM;
