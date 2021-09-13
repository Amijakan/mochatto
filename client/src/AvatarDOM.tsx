import React, { useEffect } from "react";

function AvatarDOM({
  onMouseDown,
  pos,
  isSelf,
  _backgroundColor,
  _borderColor
}: {
  onMouseDown: (MouseEvent) => void;
  pos: [number, number];
  isSelf: boolean;
  _backgroundColor: string;
  _borderColor: string;
}): JSX.Element {
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
        width: "65px",
        height: "65px",
        borderRadius: "100%",
        borderColor: _borderColor,
        borderStyle: "solid",
        background: _backgroundColor,
        position: "absolute",
        left: pos[0],
        top: pos[1],
      }}
    ></div>
  );
}

export default AvatarDOM;
