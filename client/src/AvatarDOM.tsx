import React, { useEffect } from "react";

function AvatarDOM({
  onMouseDown,
  pos,
  isSelf,
  _backgroundColor,
  _borderColor,
  initial
}: {
  onMouseDown: (MouseEvent) => void;
  pos: [number, number];
  isSelf: boolean;
  _backgroundColor: string;
  _borderColor: string;
  initial: string
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
        display: "table",
        left: pos[0],
        top: pos[1],
      }}
    >
      <div
        style={{
          color: "white",
          verticalAlign: "middle",
          textAlign: "center",
          display: "table-cell",
          fontFamily: "helvetica",
          fontSize: "30px",
          cursor: "default",
        }}
      >
        {initial}
      </div>
    </div>
  );
}

export default AvatarDOM;
