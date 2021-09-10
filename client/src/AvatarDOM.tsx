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
  useEffect(() => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const avatardom = document.querySelector(".avatar");
    if (avatardom) {
      (avatardom as HTMLElement).style.backgroundColor = "#" + randomColor;
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
        background: "black",
        position: "absolute",
        left: pos[0],
        top: pos[1],
      }}
    ></div>
  );
}

export default AvatarDOM;
