import React, { useEffect } from "react";

function AvatarDOM({
  onPointerDown,
  pos,
  isSelf,
  multiplier = 1,
  _backgroundColor,
  _borderColor,
  initial,
}: {
  onPointerDown: (PointerEvent) => void;
  pos: [number, number];
  isSelf: boolean;
  multiplier?: number;
  _backgroundColor: string;
  _borderColor: string;
  initial: string;
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
      onPointerDown={onPointerDown}
      style={{
        touchAction: "none",
        width: "65px",
        height: "65px",
        borderRadius: "100%",
        boxShadow: "0 0 0 " + (1 + multiplier * 10).toString() + "px " + _borderColor,
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
